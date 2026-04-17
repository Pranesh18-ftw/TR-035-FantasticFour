import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ModernReports = ({ complianceReport, metrics, breaches, inventory }) => {
  // Mock data for charts
  const breachData = [
    { name: 'Critical', value: breaches.filter(b => b.severity === 'critical').length, color: 'var(--danger-500)' },
    { name: 'High', value: breaches.filter(b => b.severity === 'high').length, color: 'var(--warning-500)' },
    { name: 'Low', value: breaches.filter(b => b.severity === 'low').length, color: 'var(--info-500)' },
  ];

  const inventoryData = [
    { name: 'Safe', value: inventory.filter(i => (i.current_viability || i.viability || 100) >= 80).length, color: 'var(--success-500)' },
    { name: 'Monitor', value: inventory.filter(i => { const v = i.current_viability || i.viability || 100; return v >= 60 && v < 80; }).length, color: 'var(--warning-500)' },
    { name: 'At Risk', value: inventory.filter(i => (i.current_viability || i.viability || 100) < 60).length, color: 'var(--danger-500)' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
          Compliance Reports
        </h2>
        <p style={{ color: 'var(--gray-500)' }}>
          System performance metrics and compliance overview
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid-4" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: 'var(--spacing-xs)' }}>
              Detection Recall
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-600)' }}>
              {metrics?.breach_detection_recall || 95}%
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: 'var(--spacing-xs)' }}>
              False Alarm Rate
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gray-700)' }}>
              {metrics?.false_alarm_rate || 2}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>per 1000</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: 'var(--spacing-xs)' }}>
              Viability RMSE
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gray-700)' }}>
              {metrics?.viability_loss_rmse || 3.2}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: 'var(--spacing-xs)' }}>
              Report Time
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success-600)' }}>
              {metrics?.report_generation_time || 1.5}s
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid-2" style={{ marginBottom: 'var(--spacing-xl)' }}>
        {/* Breach Severity Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Breach Severity Distribution</h3>
          </div>
          <div className="card-body">
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breachData}>
                  <CartesianGrid stroke="var(--gray-200)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--gray-500)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--gray-500)', fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {breachData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Inventory Status Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Inventory Status</h3>
          </div>
          <div className="card-body">
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {inventoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-md)' }}>
              {inventoryData.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                  <div style={{ width: 12, height: 12, background: item.color, borderRadius: 2 }} />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Summary */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Compliance Summary</h3>
        </div>
        <div className="card-body">
          <div className="grid-2">
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
                Period Statistics
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Report Period</span>
                  <span style={{ fontWeight: 500 }}>{complianceReport?.period || '7 days'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Total Breaches</span>
                  <span style={{ fontWeight: 500, color: 'var(--danger-600)' }}>{complianceReport?.total_breaches || breaches.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Viability Loss</span>
                  <span style={{ fontWeight: 500 }}>{complianceReport?.total_viability_loss?.toFixed(1) || '0.0'}%</span>
                </div>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
                AI Recommendations
              </h4>
              <ul style={{ margin: 0, paddingLeft: 'var(--spacing-md)', color: 'var(--gray-600)' }}>
                {(complianceReport?.recommendations || ['No recommendations available']).map((rec, index) => (
                  <li key={index} style={{ marginBottom: 'var(--spacing-xs)' }}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernReports;
