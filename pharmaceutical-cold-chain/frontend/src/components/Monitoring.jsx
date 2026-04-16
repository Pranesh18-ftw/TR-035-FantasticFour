import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine } from 'recharts';

const Monitoring = ({ sensorData, breaches }) => {
  const [selectedSensor, setSelectedSensor] = useState(null);
  
  // Get unique sensors
  const sensors = [...new Set(sensorData.map(r => r.sensor_id))];
  
  // Filter data for selected sensor
  const filteredData = selectedSensor 
    ? sensorData.filter(r => r.sensor_id === selectedSensor)
    : sensorData;

  const chartData = filteredData.map(reading => ({
    time: new Date(reading.timestamp).toLocaleTimeString('en-US', { hour12: false }),
    temperature: reading.temperature,
    humidity: reading.humidity,
    sensor: reading.sensor_id
  }));

  return (
    <div className="dashboard-container">
      {/* Sensor Selection */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div className="panel-header">
          <div className="panel-title">
            <span>🎯</span> Sensor Selection
          </div>
          <select 
            value={selectedSensor || ''} 
            onChange={(e) => setSelectedSensor(e.target.value || null)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}
          >
            <option value="">All Sensors</option>
            {sensors.map(sensor => (
              <option key={sensor} value={sensor}>{sensor}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sensor Grid */}
      <div className="metrics-section" style={{ marginBottom: '2rem' }}>
        {sensorData.map(reading => {
          const isBreach = reading.temperature < 2 || reading.temperature > 8;
          const isHigh = reading.temperature > 10 || reading.temperature < 0;
          
          return (
            <div 
              key={reading.sensor_id} 
              className={`metric-card ${isBreach ? (isHigh ? 'critical' : 'warning') : 'success'}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedSensor(reading.sensor_id)}
            >
              <div className="metric-icon">{isBreach ? '🚨' : '✅'}</div>
              <div className="metric-label">{reading.sensor_id}</div>
              <div className={`metric-value ${isBreach ? (isHigh ? 'critical' : 'warning') : 'success'}`}>
                {reading.temperature}°C
              </div>
              <div className="metric-trend">
                {reading.humidity && `Humidity: ${reading.humidity}%`}
              </div>
              <div style={{ 
                marginTop: '0.5rem', 
                fontSize: '0.75rem', 
                color: 'var(--text-muted)',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                {new Date(reading.timestamp).toLocaleTimeString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Chart */}
      <div className="graph-panel" style={{ marginBottom: '2rem' }}>
        <div className="panel-header">
          <div className="panel-title">
            <span>📈</span> Detailed Temperature Trend
          </div>
          <span className="panel-subtitle">
            {selectedSensor || 'All Sensors'}
          </span>
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
              <span>Loading data...</span>
            </div>
          )}
        </div>
      </div>

      {/* Breach Timeline */}
      <div className="glass-card">
        <div className="panel-header">
          <div className="panel-title">
            <span>⏱️</span> Recent Breach Events
          </div>
          <span className="panel-subtitle">{breaches.length} events</span>
        </div>
        
        {breaches.length === 0 ? (
          <div className="no-alerts">
            <div className="no-alerts-icon">✅</div>
            <p>No breaches detected</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {breaches.slice(0, 10).map((breach, idx) => (
              <div 
                key={idx} 
                className={`alert-card ${breach.severity}`}
                style={{ margin: 0 }}
              >
                <div className="alert-header">
                  <span className={`alert-severity ${breach.severity}`}>
                    {breach.severity === 'critical' ? '🔴' : breach.severity === 'high' ? '🟠' : '🔵'} 
                    {breach.severity.toUpperCase()}
                  </span>
                  <span className="alert-time">
                    {new Date(breach.start_time).toLocaleString()}
                  </span>
                </div>
                <div className="alert-unit">{breach.sensor_id}</div>
                <div className="alert-details">
                  <span>Max: {breach.max_temperature}°C</span>
                  <span>•</span>
                  <span>Duration: {breach.duration_minutes?.toFixed(1) || 0} min</span>
                  <span>•</span>
                  <span>Loss: {breach.viability_loss?.toFixed(1) || 0}%</span>
                </div>
                {breach.ai_explanation && (
                  <div style={{ 
                    marginTop: '0.75rem', 
                    padding: '0.75rem', 
                    background: 'rgba(59,130,246,0.1)', 
                    borderRadius: '6px',
                    borderLeft: '3px solid var(--accent-blue)',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <strong style={{ color: 'var(--accent-blue)' }}>AI:</strong> {breach.ai_explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Monitoring;
