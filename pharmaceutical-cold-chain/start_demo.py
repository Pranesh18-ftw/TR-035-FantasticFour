#!/usr/bin/env python3
"""
Cold Chain Monitoring System - Demo Startup Script
Starts both backend and frontend for seamless presentation
"""

import subprocess
import sys
import time
import os
import webbrowser
from pathlib import Path

def print_header(text):
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60 + "\n")

def print_status(service, status, details=""):
    icon = "✓" if status == "running" else "✗" if status == "error" else "⏳"
    color = "green" if status == "running" else "red" if status == "error" else "yellow"
    print(f"{icon} {service}: {status.upper()}")
    if details:
        print(f"   {details}")

def main():
    print_header("COLD CHAIN MONITORING SYSTEM - DEMO")
    
    # Get the project root directory
    script_dir = Path(__file__).parent
    backend_dir = script_dir / "backend"
    frontend_dir = script_dir / "frontend"
    
    print("Starting services...\n")
    
    # Start Backend
    print_status("Backend API", "starting", "Port 8002")
    try:
        backend_process = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002", "--reload"],
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            creationflags=subprocess.CREATE_NEW_CONSOLE if sys.platform == "win32" else 0
        )
        time.sleep(3)  # Give backend time to start
        print_status("Backend API", "running", "http://localhost:8002")
    except Exception as e:
        print_status("Backend API", "error", str(e))
        return
    
    # Start Frontend
    print_status("Frontend", "starting", "Port 5173")
    try:
        frontend_process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=frontend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            creationflags=subprocess.CREATE_NEW_CONSOLE if sys.platform == "win32" else 0
        )
        time.sleep(5)  # Give frontend time to start
        print_status("Frontend", "running", "http://localhost:5173")
    except Exception as e:
        print_status("Frontend", "error", str(e))
        backend_process.terminate()
        return
    
    # Open browser
    print("\n🌐 Opening browser...")
    time.sleep(2)
    webbrowser.open("http://localhost:5173")
    
    print_header("DEMO READY!")
    print("Backend API:  http://localhost:8002")
    print("Frontend UI:  http://localhost:5173")
    print("\nFeatures:")
    print("  • Real-time temperature monitoring")
    print("  • Automatic breach detection")
    print("  • Inventory management")
    print("  • Compliance reporting")
    print("  • AI-powered insights")
    print("\nPress Ctrl+C to stop all services\n")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\nShutting down services...")
        backend_process.terminate()
        frontend_process.terminate()
        print("✓ All services stopped")
        print("\nThank you for using Cold Chain Monitoring System!")

if __name__ == "__main__":
    main()
