# Cold Chain Monitoring System

A real-time web application for monitoring pharmaceutical cold chain temperatures with advanced alert systems, AI-powered insights, and comprehensive data visualization.

## Features

### Core Functionality
- **Real-time Temperature Monitoring**: Live sensor data updates every 2-3 seconds via WebSocket
- **Multi-Sensor Support**: Monitor 4 cold storage units simultaneously (COLD_STORE_1-3, PORTABLE_1)
- **Safe Range Validation**: Monitors temperatures between 2°C - 8°C (pharmaceutical standard)
- **Automatic Breach Detection**: AI-powered detection of temperature excursions
- **Alert System**: Real-time notifications for critical temperature events with severity levels
- **Inventory Management**: Track pharmaceutical inventory with viability monitoring
- **Compliance Reporting**: Generate compliance reports with AI recommendations

### Dashboard Components
- **Live Temperature Display**: Real-time temperature charts with safe zone visualization
- **Status Indicators**: Color-coded status badges (Safe/Monitor/At Risk/Quarantined)
- **Metrics Panel**: Inventory count, active alerts, system health, breach statistics
- **Alert Feed**: Live scrolling feed of active breaches with severity indicators
- **AI Analysis Panel**: Automatic root cause analysis and recommended actions
- **Inventory Overview**: Drug tracking with batch numbers, viability, and storage locations

### Technical Features
- **Responsive Design**: Professional sidebar navigation with clean modern UI
- **Real-time Updates**: WebSocket connection for instant data synchronization
- **Theme Support**: Light/Dark mode toggle with persistent preferences
- **Detail Views**: Click any inventory item or alert for detailed analysis
- **Demo Data Simulator**: Realistic temperature simulation for presentation/demo purposes
- **Professional Charts**: Interactive charts using Recharts library

## Quick Start

### Option 1: Automated Startup (Recommended)
```bash
python start_demo.py
```
This will:
- Start the backend API server (port 8002)
- Start the frontend development server (port 5173)
- Open your browser automatically

### Option 2: Manual Startup

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Open Browser:**
Navigate to http://localhost:5173 (or the port shown in terminal)

## Application Structure

### Navigation
- **Dashboard**: Overview with temperature charts, metrics, and recent alerts
- **Monitoring**: Detailed sensor view with real-time temperature tracking
- **Inventory**: Complete inventory management with viability monitoring
- **Reports**: Compliance reports with charts and AI recommendations

### Temperature Simulation
The system uses a realistic temperature simulation algorithm:

- **Normal Operation**: Temperature fluctuates between 3-6°C
- **Random Walk**: Changes by ±0.8°C per update with trend patterns
- **Demo Breaches**: Automatic temperature spikes every 30-60 seconds for demo excitement
- **Safe Range**: 2°C - 8°C with visual indicators
- **Breach Recovery**: Temperatures automatically return to safe range after 15-20 seconds

### Alert System

#### Alert Triggers
- Temperature below 2°C (too cold)
- Temperature above 8°C (too warm)
- Extended duration breaches affecting drug viability

#### Alert Features
- **Severity Levels**: Critical (red), High (orange), Low (blue)
- **Real-time Feed**: Live alert panel showing active breaches
- **AI Explanations**: Automatic root cause and risk assessment
- **Recommended Actions**: Step-by-step guidance for each breach
- **Viability Impact**: Estimated drug viability loss percentage

## File Structure

```
pharmaceutical-cold-chain/
├── start_demo.py              # Unified startup script
├── backend/
│   └── app/
│       ├── main.py              # FastAPI application
│       └── services/
│           ├── data_simulator.py    # Demo temperature simulation
│           ├── sensor_simulator.py  # Sensor management
│           ├── breach_detector.py   # Breach detection
│           ├── inventory_service.py # Inventory management
│           └── viability_calculator.py # Viability calculations
└── frontend/
    ├── src/
    │   ├── App.jsx              # Main application
    │   ├── components/
    │   │   ├── Layout.jsx           # Sidebar navigation layout
    │   │   ├── ModernDashboard.jsx  # Dashboard view
    │   │   ├── ModernMonitoring.jsx # Monitoring view
    │   │   ├── ModernInventory.jsx  # Inventory view
    │   │   ├── ModernReports.jsx    # Reports view
    │   │   ├── DetailPanel.jsx      # Detail modal component
    │   │   ├── AlertDetail.jsx      # Alert detail view
    │   │   └── InventoryDetail.jsx  # Inventory detail view
    │   ├── contexts/
    │   │   └── ThemeContext.jsx     # Light/Dark theme
    │   ├── hooks/
    │   │   ├── useDataFetching.js   # Data fetching hook
    │   │   └── useWebSocket.js      # WebSocket hook
    │   └── styles/
    │       └── modern.css           # Professional styling
    └── package.json
```

## API Endpoints

### Sensor Data
- `GET /api/sensors/current` - Current sensor readings
- `GET /api/sensors/history` - Historical readings

### Breaches
- `GET /api/breach/active` - Active breach alerts
- `POST /api/breach/analyze` - AI breach analysis

### Inventory
- `GET /api/inventory` - All inventory items
- `POST /api/inventory` - Add new item
- `PUT /api/inventory/{id}` - Update item
- `DELETE /api/inventory/{id}` - Delete item

### Reports
- `GET /api/compliance/report` - Compliance report
- `GET /api/metrics` - System metrics
- `GET /api/system/health` - System health status

### WebSocket
- `ws://localhost:8002/ws` - Real-time data stream

## Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Dependencies

### Backend
- FastAPI: Modern Python web framework
- Uvicorn: ASGI server
- Python 3.8+

### Frontend
- React 18: UI library
- Vite: Build tool
- Recharts: Chart library
- Axios: HTTP client
- Tailwind-style CSS: Professional styling

## Usage Instructions

### Starting Monitoring
1. Run `python start_demo.py` or start services manually
2. Navigate to the Dashboard to see real-time data
3. Click the Monitoring tab for detailed sensor views
4. Watch for automatic breach simulations every 30-60 seconds

### Managing Inventory
1. Go to the Inventory tab
2. View all pharmaceutical items with viability status
3. Click any item to see detailed analysis
4. Add new items using the "+ Add Item" button

### Viewing Alerts
1. Dashboard shows recent alerts in the right panel
2. Click any alert to see detailed AI analysis
3. Monitoring tab shows all active breaches in a table
4. Alerts include: temperature, duration, severity, and recommendations

### Generating Reports
1. Navigate to the Reports tab
2. View system metrics and compliance statistics
3. See breach severity distribution charts
4. Read AI-generated recommendations

### Theme Toggle
1. Click the 🌙/☀️ button in the top-right
2. System remembers your preference
3. All components adapt to light/dark modes

## Technical Implementation

### Temperature Simulation Algorithm
```python
# Realistic temperature changes with trends
noise = random.uniform(-0.8, 0.8)
trend_change = random.uniform(-0.3, 0.3)
new_temp = current_temp + trend * 0.1 + noise * 0.3

# Occasional demo breaches for presentation
if should_trigger_demo_breach():
    new_temp = random.uniform(10.0, 12.0)  # Force breach
```

### Alert Logic
- Validates temperature against 2°C - 8°C range
- Tracks breach duration and peak temperature
- Classifies severity based on temperature deviation
- Generates AI explanations automatically
- Updates UI in real-time via WebSocket

### Data Flow
1. Backend simulator generates temperature data every 2-3s
2. WebSocket broadcasts to all connected clients
3. Frontend receives data and updates charts/metrics
4. Breach detection runs automatically
5. Alerts displayed with AI analysis

## Future Enhancements
- Real sensor hardware integration
- Email/SMS alert notifications
- Historical data export (CSV/PDF)
- User authentication and roles
- Mobile app companion
- Predictive maintenance alerts
- Multi-facility support
- API integration with ERP systems

## Support
For technical support or questions about the Cold Chain Monitoring System:
- Check the GitHub repository: https://github.com/Pranesh18-ftw/TR-035-FantasticFour
- Review API documentation at http://localhost:8002/docs (when backend is running)

---

**Version:** 1.0.0  
**Last Updated:** April 2025
