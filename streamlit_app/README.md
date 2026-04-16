# 🌡️ Pharmaceutical Cold Chain Breach Detector (Streamlit Version)

A minimal working prototype for pharmaceutical cold chain monitoring with AI-powered breach explanation using NVIDIA API.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- NVIDIA API Key (optional, for AI explanations)

### Installation

1. Navigate to the streamlit_app directory:
```bash
cd streamlit_app
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. (Optional) Set up NVIDIA API key:
```bash
cp .env.example .env
# Edit .env and add your NVIDIA_API_KEY
```

### Run the Application

```bash
streamlit run app.py
```

The application will open in your browser at http://localhost:8501

## 📋 Features

- **Sensor Data Simulation**: Generates realistic temperature time-series data
- **Breach Detection**: Automatically detects temperature excursions outside safe range (2°C - 8°C)
- **Severity Classification**: Categorizes breaches as mild, high, or critical
- **AI-Powered Explanations**: Uses NVIDIA API (google/gemma-4-31b-it) to generate intelligent breach explanations
- **Interactive Visualization**: Real-time temperature graph with breach highlighting
- **Data Export**: Download sensor data and breach reports as CSV

## 🏗️ Architecture

```
streamlit_app/
├── app.py              # Main Streamlit UI
├── simulator.py        # Sensor data simulation
├── detector.py         # Breach detection logic
├── ai_explainer.py     # NVIDIA API integration
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variables template
└── README.md          # This file
```

## 🎯 Usage

1. **Generate Data**: Click "Generate New Sensor Data" to simulate temperature readings
2. **View Graph**: See temperature vs time plot with highlighted breach periods
3. **Review Breaches**: Expand each breach to see details and AI explanation
4. **Export Data**: Download sensor data and breach reports as CSV files

## ⚙️ Configuration

- **Safe Temperature Range**: 2°C - 8°C (pharmaceutical standard)
- **Severity Thresholds**:
  - Mild: < 10°C
  - High: 10-15°C
  - Critical: > 15°C
- **Simulation Parameters**: Adjustable duration and data interval via sidebar

## 🤖 AI Integration

The application uses NVIDIA's API with the `google/gemma-4-31b-it` model to generate intelligent explanations for each breach, covering:
- Likely causes
- Risk assessment
- Recommended actions

**Note**: Without an API key, the application uses mock explanations for demonstration purposes.

## 📊 Output

- Temperature vs time graph with safe range visualization
- Breach events with timestamps, duration, and severity
- AI-generated explanations for each breach
- CSV export of sensor data and breach reports

## 🔧 Development

### Testing Individual Components

```bash
# Test simulator
python simulator.py

# Test detector
python detector.py

# Test AI explainer
python ai_explainer.py
```

### Adding New Features

- Modify `simulator.py` for different data generation patterns
- Update `detector.py` for custom breach detection logic
- Extend `ai_explainer.py` for additional AI features
- Enhance `app.py` for new UI components

## 📄 License

This project is part of the Tensor'26 Hackathon.
