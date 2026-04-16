import React, { useState, useEffect } from 'react';
import './IntelligentBreachPopup.css';

const IntelligentBreachPopup = ({ breach, onClose, onAnalyze }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (breach?.intelligent_analysis) {
      setAnalysis(breach.intelligent_analysis);
    }
  }, [breach]);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8002/api/breaches/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(breach),
      });
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'moderate': return '#eab308';
      case 'mild': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getCauseIcon = (cause) => {
    if (cause?.toLowerCase().includes('door')) return '🚪';
    if (cause?.toLowerCase().includes('equipment')) return '⚙️';
    if (cause?.toLowerCase().includes('power')) return '⚡';
    if (cause?.toLowerCase().includes('human')) return '👤';
    if (cause?.toLowerCase().includes('sensor')) return '📡';
    return '⚠️';
  };

  if (!breach) return null;

  return (
    <div className="breach-popup-overlay">
      <div className="breach-popup">
        <div className="breach-popup-header">
          <div className="breach-popup-title">
            <span className="breach-icon">🚨</span>
            <h3>Critical Temperature Breach</h3>
            <span 
              className="severity-badge"
              style={{ backgroundColor: getSeverityColor(breach.severity) }}
            >
              {breach.severity?.toUpperCase()}
            </span>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="breach-details">
          <div className="detail-row">
            <span className="label">Sensor:</span>
            <span className="value">{breach.sensor_id}</span>
          </div>
          <div className="detail-row">
            <span className="label">Temperature:</span>
            <span className="value danger">{breach.max_temperature}°C</span>
          </div>
          <div className="detail-row">
            <span className="label">Duration:</span>
            <span className="value">{breach.duration_minutes} minutes</span>
          </div>
          <div className="detail-row">
            <span className="label">Facility:</span>
            <span className="value">{breach.facility_id}</span>
          </div>
        </div>

        {analysis && (
          <div className="analysis-section">
            <div className="analysis-header" onClick={() => setExpanded(!expanded)}>
              <h4>🤖 AI Analysis & Recommendations</h4>
              <span className={`expand-icon ${expanded ? 'expanded' : ''}`}>▼</span>
            </div>
            
            {expanded && (
              <div className="analysis-content">
                <div className="analysis-item">
                  <div className="analysis-label">
                    {getCauseIcon(analysis.cause)} Likely Cause:
                  </div>
                  <div className="analysis-value">{analysis.cause}</div>
                </div>

                <div className="analysis-item">
                  <div className="analysis-label">📊 Impact Assessment:</div>
                  <div className="analysis-value">{analysis.impact}</div>
                </div>

                <div className="analysis-item">
                  <div className="analysis-label">🎯 Immediate Actions:</div>
                  <ul className="action-list">
                    {analysis.actions?.map((action, index) => (
                      <li key={index} className="action-item">{action}</li>
                    ))}
                  </ul>
                </div>

                <div className="analysis-item">
                  <div className="analysis-label">🛡️ Prevention Measures:</div>
                  <ul className="prevention-list">
                    {analysis.prevention?.map((measure, index) => (
                      <li key={index} className="prevention-item">{measure}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="breach-popup-actions">
          {!analysis && (
            <button 
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? '🔄 Analyzing...' : '🧠 AI Analysis'}
            </button>
          )}
          <button className="quarantine-btn">
            🚫 Initiate Quarantine Protocol
          </button>
          <button className="report-btn">
            📄 Generate Incident Report
          </button>
        </div>

        <div className="breach-timeline">
          <div className="timeline-item">
            <div className="timeline-dot active"></div>
            <div className="timeline-content">
              <div className="timeline-time">{new Date(breach.start_time).toLocaleTimeString()}</div>
              <div className="timeline-event">Breach Detected</div>
            </div>
          </div>
          {breach.end_time && (
            <div className="timeline-item">
              <div className="timeline-dot resolved"></div>
              <div className="timeline-content">
                <div className="timeline-time">{new Date(breach.end_time).toLocaleTimeString()}</div>
                <div className="timeline-event">Breach Resolved</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntelligentBreachPopup;
