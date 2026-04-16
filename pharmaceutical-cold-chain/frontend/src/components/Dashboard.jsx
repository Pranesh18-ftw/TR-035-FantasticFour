import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine } from 'recharts';
import IntelligentBreachPopup from './IntelligentBreachPopup';

const Dashboard = ({ sensorData, breaches }) => {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showBreachPopup, setShowBreachPopup] = useState(false);
  const [selectedBreach, setSelectedBreach] = useState(null);
  
  // Debug logging
  console.log('Dashboard received sensorData:', sensorData?.length, 'items');
  console.log('Dashboard received breaches:', breaches?.length, 'items');
  
  // Prepare chart data - show last 20 readings
  const chartData = sensorData?.slice(-20).map(reading => ({
    time: reading.timestamp ? new Date(reading.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--',
    temperature: reading.temperature || 0,
    sensor: reading.sensor_id || 'Unknown'
  })) || [];

  console.log('chartData prepared:', chartData.length, 'points');

  // Calculate system health percentage
  const totalSensors = sensorData.length;
  const breachedSensors = new Set(breaches.filter(b => b.status === 'active').map(b => b.sensor_id)).size;
  const healthPercent = totalSensors > 0 ? Math.round(((totalSensors - breachedSensors) / totalSensors) * 100) : 100;

  // Calculate metrics
  const todayBreaches = breaches.filter(b => {
    const breachDate = new Date(b.start_time);
    const today = new Date();
    return breachDate.toDateString() === today.toDateString();
  }).length;

  const criticalCount = breaches.filter(b => b.severity === 'critical').length;

  // Get unique sensors
  const sensors = [...new Set(sensorData.map(r => r.sensor_id))];

  // Handle breach popup
  const handleBreachClick = useCallback((breach) => {
    setSelectedBreach(breach);
    setShowBreachPopup(true);
  }, []);

  const handleCloseBreachPopup = useCallback(() => {
    setShowBreachPopup(false);
    setSelectedBreach(null);
  }, []);

  // Auto-show popup for critical breaches
  useEffect(() => {
    const newCriticalBreach = breaches.find(b => 
      b.severity === 'critical' && 
      !b.notified && 
      new Date(b.start_time) > new Date(Date.now() - 10000) // Last 10 seconds
    );
    
    if (newCriticalBreach) {
      // Use setTimeout to avoid calling setState synchronously
      setTimeout(() => {
        handleBreachClick(newCriticalBreach);
      }, 0);
      // Mark as notified
      newCriticalBreach.notified = true;
    }
  }, [breaches, handleBreachClick]);

  return (
    <div className="dashboard-container">
      {/* System Health Bar */}
      <div className="system-health">
        <div className="health-header">
          <span className="health-label">System Health</span>
          <span className="health-value">{healthPercent}%</span>
        </div>
        <div className="health-bar">
          <div 
            className={`health-fill ${healthPercent > 90 ? 'excellent' : healthPercent > 70 ? 'good' : healthPercent > 50 ? 'warning' : 'critical'}`}
            style={{ width: `${healthPercent}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Graph + Alerts */}
      <div className="main-grid">
        {/* Temperature Graph Panel */}
        <div className="graph-panel">
          <div className="panel-header">
            <div className="panel-title">
              <span>📊</span> Temperature Monitoring
            </div>
            <span className="panel-subtitle">Real-time</span>
          </div>
          <div className="graph-overlay">
            <div className="legend-item">
              <span className="legend-dot safe"></span> Safe (2-8°C)
            </div>
            <div className="legend-item">
              <span className="legend-dot warning"></span> Warning
            </div>
            <div className="legend-item">
              <span className="legend-dot critical"></span> Critical
            </div>
          </div>
          <div className="graph-container">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#64748b" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[-5, 20]} 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    label={{ value: '°C', position: 'insideLeft', fill: '#64748b' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid rgba(59,130,246,0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                  <ReferenceArea y1={2} y2={8} fill="rgba(34,197,94,0.15)" />
                  <ReferenceLine y={2} stroke="#22c55e" strokeDasharray="3 3" />
                  <ReferenceLine y={8} stroke="#22c55e" strokeDasharray="3 3" />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#06b6d4' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="loading-container">
                <div className="spinner"></div>
                <span>Loading sensor data...</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Alerts Panel */}
        <div className="alerts-panel">
          <div className="panel-header">
            <div className="panel-title">
              <span>🔔</span> Live Alerts
            </div>
            <span className="panel-subtitle">{breaches.length} total</span>
          </div>
          <div className="alerts-scroll">
            {breaches.length === 0 ? (
              <div className="no-alerts">
                <div className="no-alerts-icon">✅</div>
                <p>No active breaches</p>
              </div>
            ) : (
              breaches.slice(0, 10).map((breach, idx) => (
                <div 
                  key={idx} 
                  className={`alert-card ${breach.severity} ${selectedAlert === idx ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedAlert(selectedAlert === idx ? null : idx);
                    handleBreachClick(breach);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="alert-header">
                    <span className={`alert-severity ${breach.severity}`}>
                      {breach.severity === 'critical' ? '🔴' : breach.severity === 'high' ? '🟠' : '🔵'} {breach.severity.toUpperCase()}
                    </span>
                    <span className="alert-time">
                      {new Date(breach.start_time).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="alert-unit">{breach.sensor_id}</div>
                  <div className="alert-details">
                    <span>{breach.max_temperature}°C</span>
                    <span>•</span>
                    <span>{breach.duration_minutes?.toFixed(0) || 0}min</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Breach Details Panel */}
      {selectedAlert !== null && breaches[selectedAlert] && (
        <div className={`details-panel ${breaches[selectedAlert].severity}`}>
          <div className="panel-header">
            <div className="panel-title">
              <span>📋</span> Breach Details
            </div>
            <span className="panel-subtitle">{breaches[selectedAlert].sensor_id}</span>
          </div>
          <div className="details-grid">
            <div className="detail-item">
              <div className="detail-label">Peak Temperature</div>
              <div className={`detail-value ${breaches[selectedAlert].severity}`}>
                {breaches[selectedAlert].max_temperature}°C
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Duration</div>
              <div className="detail-value">
                {breaches[selectedAlert].duration_minutes?.toFixed(1) || 0} min
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Viability Loss</div>
              <div className={`detail-value ${breaches[selectedAlert].viability_loss > 20 ? 'critical' : breaches[selectedAlert].viability_loss > 10 ? 'high' : ''}`}>
                {breaches[selectedAlert].viability_loss?.toFixed(1) || 0}%
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Status</div>
              <div className="detail-value" style={{ textTransform: 'capitalize' }}>
                {breaches[selectedAlert].status}
              </div>
            </div>
          </div>
          {breaches[selectedAlert].ai_explanation && (
            <div className="ai-explanation-box">
              <p>{breaches[selectedAlert].ai_explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* Metrics Cards Section */}
      <div className="metrics-section">
        <div className={`metric-card ${sensors.length > 0 ? 'success' : ''}`}>
          <span className="metric-icon">🎛️</span>
          <div className="metric-label">Active Units</div>
          <div className="metric-value">{sensors.length}</div>
          <div className="metric-trend">Across {new Set(sensorData.map(r => r.facility_id)).size} facilities</div>
        </div>

        <div className={`metric-card ${todayBreaches > 0 ? 'warning' : 'success'}`}>
          <span className="metric-icon">⚠️</span>
          <div className="metric-label">Breaches Today</div>
          <div className={`metric-value ${todayBreaches > 0 ? 'warning' : ''}`}>{todayBreaches}</div>
          <div className="metric-trend">Last 24 hours</div>
        </div>

        <div className={`metric-card ${criticalCount > 0 ? 'critical' : 'success'}`}>
          <span className="metric-icon">🚨</span>
          <div className="metric-label">Critical Events</div>
          <div className={`metric-value ${criticalCount > 0 ? 'critical' : ''}`}>{criticalCount}</div>
          <div className="metric-trend">Immediate attention</div>
        </div>

        <div className={`metric-card ${healthPercent > 90 ? 'success' : healthPercent > 70 ? 'warning' : 'critical'}`}>
          <span className="metric-icon">📈</span>
          <div className="metric-label">Stability Score</div>
          <div className={`metric-value ${healthPercent > 90 ? 'success' : healthPercent > 70 ? 'warning' : 'critical'}`}>
            {healthPercent}%
          </div>
          <div className="metric-trend">System stability</div>
        </div>
      </div>

      {/* Mini Timeline */}
      {breaches.length > 0 && (
        <div className="glass-card" style={{ marginTop: '2rem' }}>
          <div className="panel-header">
            <div className="panel-title">
              <span>⏱️</span> Recent Activity Timeline
            </div>
          </div>
          <div className="mini-timeline">
            {breaches.slice(0, 10).map((breach, idx) => (
              <div 
                key={idx} 
                className={`timeline-dot ${breach.severity}`}
                title={`${breach.sensor_id} - ${breach.max_temperature}°C`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Intelligent Breach Popup */}
      {showBreachPopup && selectedBreach && (
        <IntelligentBreachPopup
          breach={selectedBreach}
          onClose={handleCloseBreachPopup}
        />
      )}
    </div>
  );
};

export default Dashboard;
