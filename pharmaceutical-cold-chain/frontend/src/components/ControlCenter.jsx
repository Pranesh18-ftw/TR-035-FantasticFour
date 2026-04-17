import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import DetailPanel from './DetailPanel';
import AlertDetail from './AlertDetail';
import '../styles/futuristic.css';

const ControlCenter = ({ sensorData, breaches, wsConnected }) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showAlertDetail, setShowAlertDetail] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [breachMode, setBreachMode] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Detect breach mode
  useEffect(() => {
    const hasActiveBreach = breaches.some(b => b.status === 'active');
    setBreachMode(hasActiveBreach);
    
    if (hasActiveBreach && !aiExplanation) {
      generateAIExplanation(breaches.find(b => b.status === 'active'));
    }
  }, [breaches]);

  const generateAIExplanation = (breach) => {
    if (!breach) return;
    
    const explanations = {
      critical: {
        cause: "Temperature exceeded safe threshold (>8°C) for extended duration",
        risk: "Drug viability compromised. Immediate quarantine required.",
        action: "1. Isolate affected inventory\n2. Notify quality assurance\n3. Document for compliance"
      },
      high: {
        cause: "Temperature spike detected during transport",
        risk: "Moderate viability loss. Assess individual drug stability.",
        action: "1. Monitor closely\n2. Check expiry protocols\n3. Prepare backup inventory"
      }
    };
    
    setAiExplanation(explanations[breach.severity] || explanations.high);
  };

  // Prepare chart data with animated feel
  const chartData = useMemo(() => {
    const data = sensorData?.slice(-30).map((reading, index) => ({
      time: reading.timestamp ? new Date(reading.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--',
      temperature: reading.temperature || 0,
      safeMin: 2,
      safeMax: 8,
      index
    })) || [];
    return data;
  }, [sensorData]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalSensors = new Set(sensorData.map(r => r.sensor_id)).size || 4;
    const activeBreaches = breaches.filter(b => b.status === 'active').length;
    const criticalCount = breaches.filter(b => b.severity === 'critical').length;
    const todayBreaches = breaches.filter(b => {
      const breachDate = new Date(b.start_time);
      const today = new Date();
      return breachDate.toDateString() === today.toDateString();
    }).length;
    const healthPercent = totalSensors > 0 ? Math.round(((totalSensors - activeBreaches) / totalSensors) * 100) : 100;
    
    return {
      activeUnits: totalSensors,
      breachesToday: todayBreaches,
      criticalAlerts: criticalCount,
      stability: healthPercent
    };
  }, [sensorData, breaches]);

  // Get recent alerts
  const recentAlerts = useMemo(() => {
    return breaches
      .filter(b => b.status === 'active')
      .slice(0, 5)
      .map(b => ({
        id: b.id,
        severity: b.severity,
        temp: b.peak_temp?.toFixed(1) || b.current_temp?.toFixed(1) || '--',
        duration: Math.round((new Date() - new Date(b.start_time)) / 60000) || 0,
        sensor: b.sensor_id,
        time: new Date(b.start_time).toLocaleTimeString()
      }));
  }, [breaches]);

  const handleAlertClick = (alert) => {
    setSelectedAlert(alert);
    setShowAlertDetail(true);
    const breach = breaches.find(b => b.id === alert.id);
    if (breach) generateAIExplanation(breach);
  };

  const handleCloseAlertDetail = () => {
    setShowAlertDetail(false);
    setSelectedAlert(null);
  };

  return (
    <div className={`control-container ${breachMode ? 'breach-active' : ''}`}>
      {/* Breach Focus Overlay */}
      <div className={`breach-focus-overlay ${breachMode ? 'active' : ''}`} />

      {/* Status Bar */}
      <div className={`status-bar ${breachMode ? 'breach-active' : ''}`}>
        <div className="status-title">Cold Chain Control System</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '20px',
              padding: '0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              transition: 'all 0.2s ease',
            }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span style={{ fontSize: '1rem' }}>{isDark ? '🌙' : '☀️'}</span>
            <span style={{ fontWeight: 500 }}>{isDark ? 'Dark' : 'Light'}</span>
          </button>
          
          <div className={`status-indicator ${breachMode ? 'breach' : 'stable'}`}>
            <div className="status-indicator-dot" />
            <span>{breachMode ? 'BREACH DETECTED' : 'SYSTEM STABLE'}</span>
          </div>
          <div className="status-time">
            {currentTime.toLocaleTimeString('en-US', { hour12: false })}
          </div>
        </div>
      </div>

      {/* Metric Strip */}
      <div className="metric-strip">
        <div className={`metric-card ${metrics.criticalAlerts > 0 ? 'critical' : ''}`}>
          <div className="metric-icon">📡</div>
          <div className="metric-content">
            <div className="metric-label">Active Units</div>
            <div className="metric-value">{metrics.activeUnits}</div>
          </div>
        </div>
        <div className={`metric-card ${metrics.breachesToday > 0 ? 'critical' : ''}`}>
          <div className="metric-icon">⚠️</div>
          <div className="metric-content">
            <div className="metric-label">Breaches Today</div>
            <div className="metric-value">{metrics.breachesToday}</div>
          </div>
        </div>
        <div className={`metric-card ${metrics.criticalAlerts > 0 ? 'critical' : ''}`}>
          <div className="metric-icon">🔴</div>
          <div className="metric-content">
            <div className="metric-label">Critical Alerts</div>
            <div className="metric-value">{metrics.criticalAlerts}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <div className="metric-label">Stability</div>
            <div className="metric-value">{metrics.stability}%</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="main-grid">
        {/* Temperature Graph - Centerpiece */}
        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-title">Real-Time Temperature Monitor</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Live • 2-8°C Safe Zone
            </div>
          </div>
          <div className="graph-container">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.1)" strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  stroke="#64748b" 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                />
                <YAxis 
                  domain={[-5, 15]} 
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#f8fafc'
                  }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                
                {/* Safe Zone Band */}
                <ReferenceArea y1={2} y2={8} fill="rgba(16, 185, 129, 0.08)" stroke="rgba(16, 185, 129, 0.3)" strokeDasharray="4 4" />
                
                {/* Safe Zone Lines */}
                <ReferenceLine y={2} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1} />
                <ReferenceLine y={8} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1} />
                
                {/* Temperature Line */}
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Panel - Alert Feed */}
        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-title">Live Alert Feed</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {recentAlerts.length} Active
            </div>
          </div>
          <div className="alert-feed">
            {recentAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
                <div>No active alerts</div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>System operating normally</div>
              </div>
            ) : (
              recentAlerts.map((alert, index) => (
                <div 
                  key={alert.id} 
                  className={`alert-item ${alert.severity}`}
                  onClick={() => handleAlertClick(alert)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="alert-indicator" />
                  <div className="alert-content">
                    <div className="alert-severity">
                      {alert.severity.toUpperCase()}
                    </div>
                    <div className="alert-details">
                      {alert.temp}°C • {alert.duration} min
                    </div>
                  </div>
                  <div className="alert-time">{alert.sensor}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom - AI Panel */}
      {aiExplanation && (
        <div className="ai-panel">
          <div className="ai-header">
            <div className="ai-icon">🤖</div>
            <div className="ai-title">AI Analysis</div>
          </div>
          <div className="ai-content">
            <div className="ai-section">
              <div className="ai-section-label">Root Cause</div>
              <div className="ai-section-value">{aiExplanation.cause}</div>
            </div>
            <div className="ai-section">
              <div className="ai-section-label">Risk Assessment</div>
              <div className="ai-section-value">{aiExplanation.risk}</div>
            </div>
            <div className="ai-section">
              <div className="ai-section-label">Recommended Actions</div>
              <div className="ai-section-value" style={{ whiteSpace: 'pre-line' }}>{aiExplanation.action}</div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Detail Panel */}
      <DetailPanel 
        isOpen={showAlertDetail}
        onClose={handleCloseAlertDetail}
        title={`Alert: ${selectedAlert?.sensor || ''}`}
      >
        <AlertDetail 
          alert={selectedAlert}
          onClose={handleCloseAlertDetail}
        />
      </DetailPanel>
    </div>
  );
};

export default ControlCenter;
