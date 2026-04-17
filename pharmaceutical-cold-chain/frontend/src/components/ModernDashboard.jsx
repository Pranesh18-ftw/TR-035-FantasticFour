import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';

const ModernDashboard = ({ sensorData, breaches, inventory, metrics }) => {
  // Calculate metrics
  const totalItems = inventory.length;
  const quarantinedItems = inventory.filter(i => i.status === 'quarantined').length;
  const atRiskItems = inventory.filter(i => (i.current_viability || i.viability || 100) < 80).length;
  const activeBreaches = breaches.filter(b => b.status === 'active').length;
  
  // Chart data - last 20 readings
  const chartData = sensorData?.slice(-20).map(reading => ({
    time: reading.timestamp ? new Date(reading.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '--:--',
    temperature: reading.temperature || 0,
  })) || [];

  const recentAlerts = breaches
    .filter(b => b.status === 'active')
    .slice(0, 5)
    .map(b => ({
      id: b.id,
      severity: b.severity,
      temp: b.peak_temp?.toFixed(1) || b.current_temp?.toFixed(1) || '--',
      sensor: b.sensor_id,
      time: new Date(b.start_time).toLocaleTimeString()
    }));

  return (
    <div>
      {/* Metric Cards */}
      <div className="metric-grid">
        <div className="metric-card-modern">
          <div className="metric-label-modern">Total Inventory</div>
          <div className="metric-value-modern">{totalItems}</div>
          <div className="metric-delta positive">
            <span>📦</span> Active items
          </div>
        </div>
        
        <div className="metric-card-modern">
          <div className="metric-label-modern">Active Alerts</div>
          <div className="metric-value-modern" style={{ color: activeBreaches > 0 ? 'var(--danger-600)' : 'var(--success-600)' }}>
            {activeBreaches}
          </div>
          <div className={`metric-delta ${activeBreaches > 0 ? 'negative' : 'positive'}`}>
            <span>{activeBreaches > 0 ? '⚠️' : '✓'}</span> {activeBreaches > 0 ? 'Requires attention' : 'All clear'}
          </div>
        </div>
        
        <div className="metric-card-modern">
          <div className="metric-label-modern">At Risk Items</div>
          <div className="metric-value-modern" style={{ color: atRiskItems > 0 ? 'var(--warning-600)' : 'var(--success-600)' }}>
            {atRiskItems}
          </div>
          <div className={`metric-delta ${atRiskItems > 0 ? 'negative' : 'positive'}`}>
            <span>{atRiskItems > 0 ? '⚠️' : '✓'}</span> Below 80% viability
          </div>
        </div>
        
        <div className="metric-card-modern">
          <div className="metric-label-modern">System Health</div>
          <div className="metric-value-modern" style={{ color: 'var(--success-600)' }}>
            {metrics?.breach_detection_recall || 95}%
          </div>
          <div className="metric-delta positive">
            <span>✓</span> Detection accuracy
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid-2" style={{ marginBottom: 'var(--spacing-xl)' }}>
        {/* Temperature Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Temperature Monitoring</h3>
              <p className="card-subtitle">Real-time sensor data (2-8°C safe zone)</p>
            </div>
          </div>
          <div className="card-body">
            <div style={{ height: '280px' }}>
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
                  <ReferenceArea y1={2} y2={8} fill="var(--success-50)" />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="var(--primary-600)" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: 'var(--primary-600)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Alerts</h3>
              <p className="card-subtitle">{recentAlerts.length} active alerts requiring attention</p>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentAlerts.length === 0 ? (
              <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--gray-500)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-md)' }}>✓</div>
                <div>No active alerts</div>
                <div style={{ fontSize: '0.875rem', marginTop: 'var(--spacing-sm)' }}>System operating normally</div>
              </div>
            ) : (
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {recentAlerts.map((alert, index) => (
                  <div 
                    key={alert.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-md)',
                      padding: 'var(--spacing-md) var(--spacing-lg)',
                      borderBottom: index < recentAlerts.length - 1 ? '1px solid var(--gray-100)' : 'none',
                      background: alert.severity === 'critical' ? 'var(--danger-50)' : 'transparent',
                    }}
                  >
                    <span style={{ 
                      fontSize: '1.25rem',
                      color: alert.severity === 'critical' ? 'var(--danger-600)' : 'var(--warning-600)'
                    }}>
                      {alert.severity === 'critical' ? '🔴' : '⚠️'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-900)' }}>
                        {alert.sensor}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                        {alert.temp}°C • {alert.time}
                      </div>
                    </div>
                    <span className={`status-badge ${alert.severity === 'critical' ? 'danger' : 'warning'}`}>
                      {alert.severity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inventory Overview */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Inventory Overview</h3>
            <p className="card-subtitle">Quick view of recent inventory items</p>
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'inventory' }))}
          >
            View All
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Drug Name</th>
                  <th>Batch Number</th>
                  <th>Storage Unit</th>
                  <th>Viability</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.slice(0, 5).map(item => {
                  const viability = item.current_viability || item.viability || 100;
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 500 }}>{item.drug_name}</td>
                      <td>{item.batch_number}</td>
                      <td>{item.storage_unit}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                          <div style={{
                            width: '60px',
                            height: '6px',
                            background: 'var(--gray-200)',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${viability}%`,
                              height: '100%',
                              background: viability > 80 ? 'var(--success-500)' : viability > 60 ? 'var(--warning-500)' : 'var(--danger-500)',
                              borderRadius: '3px'
                            }} />
                          </div>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{viability.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${
                          item.status === 'quarantined' ? 'danger' : 
                          viability < 60 ? 'danger' : 
                          viability < 80 ? 'warning' : 'success'
                        }`}>
                          {item.status === 'quarantined' ? 'Quarantined' : 
                           viability < 60 ? 'At Risk' : 
                           viability < 80 ? 'Monitor' : 'Safe'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;
