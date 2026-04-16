from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import asyncio
from datetime import datetime

from .models import (
    TemperatureReading, BreachEvent, MonitoringStatus,
    TemperatureRange, ModeRequest, TemperatureRequest
)
from .services.temperature import TemperatureService
from .services.breach import BreachService
from .services.data import DataService
from .utils.logger import Logger

app = FastAPI(title="Cold Chain Breach Detector API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files from Frontend directory
frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../Frontend"))
if os.path.exists(frontend_path):
    app.mount("/static", StaticFiles(directory=frontend_path), name="static")

# Initialize services
temp_service = TemperatureService()
breach_service = BreachService()
data_service = DataService()
# Use absolute path for logs directory
log_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../logs"))
logger = Logger(log_dir=log_dir)

# Global state
current_mode = "simulation"
monitoring_active = False
monitoring_task = None


@app.get("/", tags=["Status"])
async def root():
    """API status endpoint - redirects to dashboard"""
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/dashboard")


@app.get("/status", response_model=MonitoringStatus, tags=["Monitoring"])
async def get_status():
    """Get current monitoring status"""
    return MonitoringStatus(
        current_temp=temp_service.current_temp,
        status="BREACH" if breach_service.in_breach else "SAFE",
        breach_count=breach_service.get_breach_count(),
        recent_breaches=breach_service.get_recent_breaches(5),
        mode=current_mode,
        last_update=datetime.now()
    )


@app.get("/breaches", tags=["Monitoring"])
async def get_breaches():
    """Get breach history"""
    return {
        "total_breaches": breach_service.get_breach_count(),
        "breaches": breach_service.get_recent_breaches(20)
    }


@app.get("/logs", tags=["Monitoring"])
async def get_logs():
    """Get system logs"""
    return {
        "logs": logger.get_logs(50)
    }


@app.post("/reset", tags=["Monitoring"])
async def reset_monitoring():
    """Reset monitoring state"""
    breach_service.reset()
    logger.log_info("Monitoring reset")
    return {"message": "Monitoring reset successfully"}


@app.post("/temperature", tags=["Input"])
async def submit_temperature(request: TemperatureRequest):
    """Submit manual temperature reading"""
    reading = temp_service.set_manual_temperature(request.temperature, request.humidity)
    breach = breach_service.check_breach(reading, temp_service)
    
    if breach:
        logger.log_breach(breach.message, breach.severity)
    
    return {
        "message": "Temperature submitted",
        "reading": reading,
        "breach_detected": breach is not None
    }


@app.post("/mode", tags=["Configuration"])
async def set_mode(request: ModeRequest):
    """Switch between simulation and manual mode"""
    global current_mode
    if request.mode not in ["simulation", "manual"]:
        raise HTTPException(status_code=400, detail="Invalid mode. Use 'simulation' or 'manual'")
    
    current_mode = request.mode
    logger.log_info(f"Mode switched to {current_mode}")
    return {"message": f"Mode set to {current_mode}"}


@app.get("/config", response_model=TemperatureRange, tags=["Configuration"])
async def get_config():
    """Get current configuration"""
    return TemperatureRange(
        min_temp=temp_service.min_temp,
        max_temp=temp_service.max_temp
    )


@app.get("/dashboard", response_class=HTMLResponse, tags=["Frontend"])
async def get_dashboard():
    """Serve the frontend dashboard"""
    try:
        frontend_path = os.path.join(os.path.dirname(__file__), "../../Frontend/index.html")
        if os.path.exists(frontend_path):
            with open(frontend_path, 'r', encoding='utf-8') as f:
                return f.read()
        return "<h1>Frontend not found. Please ensure Frontend/index.html exists.</h1>"
    except Exception as e:
        return f"<h1>Error loading dashboard: {str(e)}</h1>"


async def monitoring_loop():
    """Background task for continuous monitoring"""
    global monitoring_active
    while monitoring_active:
        reading = temp_service.get_current_temperature(current_mode)
        breach = breach_service.check_breach(reading, temp_service)
        
        if breach:
            logger.log_breach(breach.message, breach.severity)
        
        await asyncio.sleep(5)  # Check every 5 seconds


@app.post("/start", tags=["Monitoring"])
async def start_monitoring(background_tasks: BackgroundTasks):
    """Start automatic monitoring"""
    global monitoring_active, monitoring_task
    
    if monitoring_active:
        return {"message": "Monitoring already active"}
    
    monitoring_active = True
    background_tasks.add_task(monitoring_loop)
    logger.log_info("Monitoring started")
    return {"message": "Monitoring started"}


@app.post("/stop", tags=["Monitoring"])
async def stop_monitoring():
    """Stop automatic monitoring"""
    global monitoring_active
    monitoring_active = False
    logger.log_info("Monitoring stopped")
    return {"message": "Monitoring stopped"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
