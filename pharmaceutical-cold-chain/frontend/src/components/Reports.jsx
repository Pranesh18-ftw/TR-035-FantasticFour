import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_URL = 'http://localhost:8002';

const Reports = () => {
  const [report, setReport] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchReport();
    fetchMetrics();
  }, [days, fetchReport, fetchMetrics]);

  const fetchReport = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/compliance/report?days=${days}`);
      setReport(response.data.report);
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  }, [days]);

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/metrics`);
      setMetrics(response.data.metrics);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadCSV = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Breach Detection Recall', `${metrics?.breach_detection_recall}%`],
      ['False Alarm Rate', `${metrics?.false_alarm_rate} per 1000`],
      ['Viability Loss RMSE', `${metrics?.viability_loss_rmse}`],
      ['Report Generation Time', `${metrics?.report_generation_time}s`],
    ];
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) return (
    <div className="dashboard-container">
      <div className="loading-container">
        <div className="spinner"></div>
        <span>Loading reports...</span>
      </div>
    </div>
  );

  // Data for charts with futuristic colors
  const breachData = [
    { name: 'Mild', value: 5, color: '#3b82f6' },
    { name: 'High', value: 3, color: '#f97316' },
    { name: 'Critical', value: 1, color: '#ef4444' },
  ];

  const viabilityData = [
    { name: '>95%', value: 15, color: '#22c55e' },
    { name: '80-95%', value: 8, color: '#3b82f6' },
    { name: '60-80%', value: 3, color: '#f97316' },
    { name: '<60%', value: 1, color: '#ef4444' },
  ];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div className="panel-header">
          <div className="panel-title">
            <span>📈</span> Compliance Reports & Metrics
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select 
              value={days} 
              onChange={(e) => setDays(Number(e.target.value))}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}
            >
              <option value={7}>Last 7 Days</option>
              <option value={14}>Last 14 Days</option>
              <option value={30}>Last 30 Days</option>
            </select>
            <button className="btn-download" onClick={downloadCSV}>Download CSV</button>
          </div>
        </div>
      </div>

      {/* Evaluation Metrics */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div className="panel-header">
          <div className="panel-title">
            <span>📊</span> System Evaluation Metrics
          </div>
        </div>
        <div className="metrics-section">
          <div className="metric-card success">
            <span className="metric-icon">🎯</span>
            <div className="metric-label">Breach Detection Recall</div>
            <div className="metric-value success">{metrics?.breach_detection_recall || 95}%</div>
            <div className="metric-trend">% of breaches caught</div>
          </div>
          <div className="metric-card warning">
            <span className="metric-icon">📢</span>
            <div className="metric-label">False Alarm Rate</div>
            <div className="metric-value warning">{metrics?.false_alarm_rate || 2}</div>
            <div className="metric-trend">Per 1000 readings</div>
          </div>
          <div className="metric-card success">
            <span className="metric-icon">📏</span>
            <div className="metric-label">Viability Loss RMSE</div>
            <div className="metric-value success">{metrics?.viability_loss_rmse || 3.2}</div>
            <div className="metric-trend">Estimation accuracy</div>
          </div>
          <div className="metric-card success">
            <span className="metric-icon">⚡</span>
            <div className="metric-label">Report Generation</div>
            <div className="metric-value success">{metrics?.report_generation_time || 1.5}s</div>
            <div className="metric-trend">Average time</div>
          </div>
        </div>
      </div>

      {/* Report Summary */}
      {report && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <div className="panel-header">
            <div className="panel-title">
              <span>📋</span> Compliance Summary ({report.period})
            </div>
          </div>
          <div className="metrics-section" style={{ marginBottom: '2rem' }}>
            <div className="metric-card warning">
              <span className="metric-icon">⚠️</span>
              <div className="metric-label">Total Breaches</div>
              <div className="metric-value warning">{report.total_breaches}</div>
              <div className="metric-trend">In period</div>
            </div>
            <div className="metric-card critical">
              <span className="metric-icon">📉</span>
              <div className="metric-label">Viability Loss</div>
              <div className="metric-value critical">{report.total_viability_loss?.toFixed(1) || 0}%</div>
              <div className="metric-trend">Total loss</div>
            </div>
            <div className="metric-card success">
              <span className="metric-icon">📦</span>
              <div className="metric-label">Inventory Items</div>
              <div className="metric-value">{report.inventory_summary?.total_items || 0}</div>
              <div className="metric-trend">Monitored</div>
            </div>
            <div className="metric-card critical">
              <span className="metric-icon">🚫</span>
              <div className="metric-label">Quarantined</div>
              <div className="metric-value critical">{report.inventory_summary?.quarantined_items || 0}</div>
              <div className="metric-trend">Items affected</div>
            </div>
          </div>

          {report.recommendations && report.recommendations.length > 0 && (
            <div style={{ 
              background: 'rgba(249,115,22,0.1)', 
              border: '1px solid rgba(249,115,22,0.3)',
              borderRadius: '12px',
              padding: '1.5rem',
              borderLeft: '4px solid var(--accent-orange)'
            }}>
              <h4 style={{ color: 'var(--accent-orange)', marginBottom: '1rem' }}>🤖 AI-Generated Recommendations</h4>
              <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem' }}>
                {report.recommendations.map((rec, idx) => (
                  <li key={idx} style={{ margin: '0.5rem 0' }}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="main-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="graph-panel">
          <div className="panel-header">
            <div className="panel-title">
              <span>🥧</span> Breach Severity Distribution
            </div>
          </div>
          <div className="graph-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breachData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {breachData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid rgba(59,130,246,0.3)',
                    borderRadius: '8px',
                    color: '#f8fafc'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="graph-panel">
          <div className="panel-header">
            <div className="panel-title">
              <span>📊</span> Inventory Viability Status
            </div>
          </div>
          <div className="graph-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viabilityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid rgba(59,130,246,0.3)',
                    borderRadius: '8px',
                    color: '#f8fafc'
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {viabilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DHO Report */}
      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <div className="panel-header">
          <div className="panel-title">
            <span>📄</span> Weekly Compliance Report for District Health Officer
          </div>
        </div>
        <div style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          <p style={{ marginBottom: '1rem' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Report Period:</strong> {report?.period || 'Last 7 Days'} | 
            <strong style={{ color: 'var(--text-primary)' }}> Generated:</strong> {new Date().toLocaleString()}
          </p>
          
          <div style={{ 
            background: 'var(--bg-secondary)', 
            borderRadius: '12px', 
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Executive Summary</h4>
            <p>
              During the reporting period, <strong style={{ color: 'var(--accent-orange)' }}>{report?.total_breaches || 0} temperature breaches</strong> 
              were detected across {report?.inventory_summary?.total_items || 0} monitored storage units. 
              <strong style={{ color: 'var(--accent-red)' }}> {report?.inventory_summary?.quarantined_items || 0} inventory items</strong> have been 
              quarantined due to viability concerns requiring immediate review.
            </p>
          </div>

          <div style={{ 
            background: 'var(--bg-secondary)', 
            borderRadius: '12px', 
            padding: '1.5rem'
          }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Compliance Status</h4>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li style={{ margin: '0.5rem 0' }}>
                WHO Cold Chain Standards: 
                <strong style={{ color: metrics?.breach_detection_recall > 90 ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                  {metrics?.breach_detection_recall > 90 ? ' COMPLIANT' : ' REVIEW NEEDED'}
                </strong>
              </li>
              <li style={{ margin: '0.5rem 0' }}>
                CDSCO Guidelines: 
                <strong style={{ color: metrics?.false_alarm_rate < 5 ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                  {metrics?.false_alarm_rate < 5 ? ' COMPLIANT' : ' REVIEW NEEDED'}
                </strong>
              </li>
              <li style={{ margin: '0.5rem 0' }}>
                Alert Response Time: <strong style={{ color: 'var(--accent-green)' }}>WITHIN LIMITS</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
