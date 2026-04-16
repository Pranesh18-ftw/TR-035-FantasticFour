# 🌡️ Cold Chain Breach Detector

A comprehensive real-time temperature monitoring system for pharmaceutical cold chain management with automatic breach detection and alerting.

## 🏗️ Architecture

```
cold-chain-detector/
├── backend/                 # FastAPI Python backend
│   ├── app/
│   │   ├── main.py         # API endpoints & web server
│   │   ├── models.py       # Data models (Temperature, Breach, Status)
│   │   ├── services/       # Business logic
│   │   │   ├── temperature.py  # Temperature monitoring
│   │   │   ├── breach.py        # Breach detection logic
│   │   │   └── data.py          # Data simulation & CSV import
│   │   └── utils/
│   │       └── logger.py        # Logging system
│   └── run.py              # Backend launcher
├── Frontend/               # Web dashboard
│   ├── index.html         # Dashboard UI
│   ├── style.css          # Modern styling
│   └── script.js          # Interactive JavaScript
├── data/
│   └── sample_data.csv    # Sample temperature data
├── logs/                  # Auto-generated breach logs
├── run_demo.py           # Demo script
├── serve_frontend.py     # Simple frontend server
└── requirements.txt      # Python dependencies
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Start the backend:
```bash
cd backend
python run.py
```

3. Access the dashboard:
- **Dashboard**: http://localhost:8001/dashboard
- **API Docs**: http://localhost:8001/docs

### Alternative Frontend Server

If you prefer to serve the frontend separately:

```bash
python serve_frontend.py
```

Then access at http://localhost:8080

## 🎯 Features

### Temperature Monitoring
- Real-time monitoring every 5 seconds
- Configurable safe range: 2°C to 8°C (pharmaceutical standard)
- Multiple data sources: Simulation, CSV import, Manual input
- Humidity monitoring support

### Breach Detection System
- Automatic breach detection when temperature exceeds safe range
- Severity classification:
  - **Low severity**: ≤2°C deviation
  - **High severity**: >2°C deviation
- Recovery detection when temperature returns to safe range
- Timestamp logging for all events

### Input Methods
- **Simulation Mode**: Automatic realistic temperature fluctuations
- **Manual Mode**: User input via web interface
- **CSV Import**: Historical data analysis (via API)

### Web Dashboard
- Live status display with color-coded indicators
- Current temperature and status (SAFE/BREACH)
- Breach counter and history
- Real-time system logs
- Mode switching between simulation and manual
- Reset functionality

## �️ API Endpoints

```
GET  /                    # API status
GET  /status             # Current monitoring status
GET  /breaches           # Breach history
GET  /logs               # System logs
POST /reset              # Reset monitoring
POST /temperature        # Submit manual temperature
POST /mode               # Switch modes
GET  /config             # Configuration
POST /start              # Start monitoring
POST /stop               # Stop monitoring
GET  /dashboard          # Web dashboard
```

## 📊 Usage Examples

### Manual Temperature Input

1. Open the dashboard at http://localhost:8001/dashboard
2. Click "Manual Mode" button
3. Enter temperature (e.g., 15.0°C)
4. Click Submit or press Enter
5. View immediate breach detection

### Run Demo

```bash
# Make sure backend is running first
cd backend
python run.py

# In another terminal
python run_demo.py
```

### API Usage with curl

```bash
# Get current status
curl http://localhost:8001/status

# Submit manual temperature
curl -X POST http://localhost:8001/temperature \
  -H "Content-Type: application/json" \
  -d '{"temperature": 15.0}'

# Switch to simulation mode
curl -X POST http://localhost:8001/mode \
  -H "Content-Type: application/json" \
  -d '{"mode": "simulation"}'

# Start monitoring
curl -X POST http://localhost:8001/start
```

## ⚙️ Configuration

Configuration options (can be modified in `backend/app/services/temperature.py`):
- **Safe temperature range**: 2°C - 8°C
- **Severity threshold**: 2°C deviation
- **Update interval**: 5 seconds
- **Data sources**: Simulation, CSV, Manual

## 📝 Data Models

- **TemperatureReading**: timestamp, temperature, humidity
- **BreachEvent**: timestamp, temperature, deviation, severity, message
- **MonitoringStatus**: current_temp, status, breach_count, recent_breaches
- **TemperatureRange**: min_temp, max_temp

## 🔧 Development

### Project Structure

The backend follows a modular architecture:
- `main.py`: FastAPI application with endpoints
- `models.py`: Pydantic data models
- `services/`: Business logic layer
- `utils/`: Utility functions (logging)

### Adding New Features

1. Add new models in `models.py`
2. Implement business logic in `services/`
3. Add endpoints in `main.py`
4. Update frontend in `Frontend/` directory

## 📄 License

This project is part of the Tensor'26 Hackathon.

## 🚀 Let's Build Something Amazing!
