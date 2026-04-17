import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const ModernMonitoring = ({ sensorData, breaches, inventory }) => {
  // Get unique sensors
  const sensors = [...new Set(sensorData.map(r => r.sensor_id))];
  
  // Calculate stats per sensor
  const sensorStats = sensors.map(sensorId => {
    const readings = sensorData.filter(r => r.sensor_id === sensorId);
    const latest = readings[readings.length - 1];
    const avg = readings.reduce((sum, r) => sum + r.temperature, 0) / readings.length;
    const breachesForSensor = breaches.filter(b => b.sensor_id === sensorId && b.status === 'active');
    
    return {
      id: sensorId,
      latest: latest?.temperature || 0,
      avg: avg.toFixed(1),
      readings: readings.length,
      breaches: breachesForSensor.length,
      status: latest?.temperature > 8 || latest?.temperature < 2 ? 'alert' : 'normal'
    };
  });

  // Chart data
  const chartData = sensorData?.slice(-30).map(reading => ({
    time: reading.timestamp ? new Date(reading.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '--:--',
    temp: reading.temperature || 0,
    min: 2,
    max: 8,
  })) || [];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
          Real-Time Monitoring
        </h2>
        <p style={{ color: 'var(--gray-500)' }}>
          {sensors.length} sensors active • {breaches.filter(b => b.status === 'active').length} active alerts
        </p>
      </div>

      {/* Sensor Cards */}
      <div className="grid-2" style={{ marginBottom: 'var(--spacing-xl)' }}>
        {sensorStats.map(sensor => (
          <div key={sensor.id} className="card">
            <div className="card-body">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: 'var(--spacing-md)'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
                    {sensor.id}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                    {sensor.readings} readings • Avg: {sensor.avg}°C
                  </p>
                </div>
                <span className={`status-badge ${sensor.status === 'alert' ? 'danger' : 'success'}`}>
                  {sensor.status === 'alert' ? 'Alert' : 'Normal'}
                </span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'baseline', 
                gap: 'var(--spacing-sm)',
                marginBottom: 'var(--spacing-sm)'
              }}>
                <span style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 700, 
                  color: sensor.latest > 8 || sensor.latest < 2 ? 'var(--danger-600)' : 'var(--gray-900)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {sensor.latest.toFixed(1)}°C
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                  Current
                </span>
              </div>

              {sensor.breaches > 0 && (
                <div className="alert alert-danger" style={{ marginTop: 'var(--spacing-md)' }}>
                  ⚠️ {sensor.breaches} active breach{sensor.breaches !== 1 ? 'es' : ''} detected
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Temperature History Chart */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Temperature History</h3>
            <p className="card-subtitle">Last 30 readings across all sensors</p>
          </div>
        </div>
        <div className="card-body">
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="var(--gray-200)" strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  stroke="var(--gray-400)" 
                  tick={{ fill: 'var(--gray-500)', fontSize: 11 }}
                />
                <YAxis 
                  domain={[0, 15]} 
                  stroke="var(--gray-400)"
                  tick={{ fill: 'var(--gray-500)', fontSize: 11 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid var(--gray-200)',
                    borderRadius: '6px',
                    boxShadow: 'var(--shadow-md)'
                  }}
                />
                <ReferenceLine y={8} stroke="var(--warning-500)" strokeDasharray="4 4" label="Max" />
                <ReferenceLine y={2} stroke="var(--info-500)" strokeDasharray="4 4" label="Min" />
                <Line 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="var(--primary-600)" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Alerts Table */}
      {breaches.filter(b => b.status === 'active').length > 0 && (
        <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
          <div className="card-header">
            <h3 className="card-title">Active Breaches</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Sensor ID</th>
                    <th>Temperature</th>
                    <th>Duration</th>
                    <th>Severity</th>
                    <th>Started</th>
                  </tr>
                </thead>
                <tbody>
                  {breaches
                    .filter(b => b.status === 'active')
                    .map(breach => (
                      <tr key={breach.id}>
                        <td style={{ fontWeight: 500 }}>{breach.sensor_id}</td>
                        <td style={{ color: 'var(--danger-600)', fontWeight: 600 }}>
                          {breach.peak_temp?.toFixed(1) || breach.current_temp?.toFixed(1)}°C
                        </td>
                        <td>
                          {Math.round((new Date() - new Date(breach.start_time)) / 60000)} min
                        </td>
                        <td>
                          <span className={`status-badge ${
                            breach.severity === 'critical' ? 'danger' : 
                            breach.severity === 'high' ? 'warning' : 'info'
                          }`}>
                            {breach.severity}
                          </span>
                        </td>
                        <td>{new Date(breach.start_time).toLocaleString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernMonitoring;
