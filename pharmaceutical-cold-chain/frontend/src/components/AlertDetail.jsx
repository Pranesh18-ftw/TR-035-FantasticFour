import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import '../styles/futuristic.css';

const AlertDetail = ({ alert, onClose }) => {
  if (!alert) return null;

  // Calculate viability loss based on severity and duration
  const calculateViabilityLoss = () => {
    const baseLoss = alert.severity === 'critical' ? 25 : alert.severity === 'high' ? 15 : 8;
    const durationMultiplier = Math.min(alert.duration / 30, 2); // Max 2x multiplier
    return Math.round(baseLoss * durationMultiplier);
  };

  const viabilityLoss = calculateViabilityLoss();
  const remainingViability = Math.max(0, 100 - viabilityLoss);

  // Get severity color
  const getSeverityColor = () => {
    switch (alert.severity) {
      case 'critical': return 'var(--neon-red)';
      case 'high': return 'var(--neon-orange)';
      default: return 'var(--neon-blue)';
    }
  };

  const severityColor = getSeverityColor();

  // AI Explanation
  const getAIExplanation = () => {
    if (alert.severity === 'critical') {
      return {
        cause: `Temperature exceeded safe threshold (>8°C) for ${alert.duration} minutes. Possible causes: equipment malfunction, door left open, or power interruption.`,
        risk: `Severe viability loss (~${viabilityLoss}%). Drug efficacy significantly compromised. Immediate quarantine required.`,
        action: `1. Isolate affected batch immediately\n2. Tag as 'DO NOT DISTRIBUTE'\n3. Notify QA team within 15 minutes\n4. Document incident for compliance report\n5. Initiate backup inventory protocol`
      };
    } else if (alert.severity === 'high') {
      return {
        cause: `Temperature spike detected at ${alert.temp}°C during transport or storage. Duration: ${alert.duration} minutes.`,
        risk: `Moderate viability loss (~${viabilityLoss}%). Individual drug stability assessment required.`,
        action: `1. Increase monitoring frequency to 5-min intervals\n2. Check drug stability data sheets\n3. Prepare backup inventory\n4. Escalate if temp continues rising`
      };
    } else {
      return {
        cause: `Brief temperature excursion detected. Peak: ${alert.temp}°C for ${alert.duration} minutes.`,
        risk: `Minor viability impact (~${viabilityLoss}%). Likely within acceptable limits.`,
        action: `1. Continue standard monitoring\n2. Log incident for records\n3. Verify storage unit calibration`
      };
    }
  };

  const aiExp = getAIExplanation();

  // Mock temperature spike data for visualization
  const spikeData = [
    { time: '-30m', temp: 5.2 },
    { time: '-20m', temp: 5.8 },
    { time: '-10m', temp: 7.1 },
    { time: 'Start', temp: alert.temp },
    { time: '+10m', temp: alert.temp * 0.9 },
    { time: '+20m', temp: 7.5 },
    { time: '+30m', temp: 6.2 },
  ];

  return (
    <div>
      {/* Alert Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '12px',
          background: `${severityColor}20`,
          border: `3px solid ${severityColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.75rem',
          boxShadow: `0 0 20px ${severityColor}40`,
        }}>
          {alert.severity === 'critical' ? '🔴' : alert.severity === 'high' ? '⚠️' : 'ℹ️'}
        </div>
        <div>
          <div style={{
            fontSize: '0.75rem',
            color: severityColor,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '0.25rem',
          }}>
            {alert.severity} Alert
          </div>
          <div style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}>
            {alert.sensor}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{
          background: 'var(--bg-glass)',
          padding: '1.25rem',
          borderRadius: '12px',
          border: `2px solid ${severityColor}`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: severityColor }}>
            {alert.temp}°C
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Peak Temperature
          </div>
        </div>
        <div style={{
          background: 'var(--bg-glass)',
          padding: '1.25rem',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {alert.duration}m
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Duration
          </div>
        </div>
        <div style={{
          background: 'var(--bg-glass)',
          padding: '1.25rem',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center',
        }}>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: 700, 
            color: viabilityLoss > 20 ? 'var(--neon-red)' : viabilityLoss > 10 ? 'var(--neon-orange)' : 'var(--neon-green)',
          }}>
            {viabilityLoss}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Est. Viability Loss
          </div>
        </div>
      </div>

      {/* Temperature Timeline */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ 
          fontSize: '1rem', 
          color: 'var(--text-primary)', 
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          📈 Temperature Timeline
        </h3>
        <div style={{ 
          height: '180px', 
          background: 'var(--bg-glass)',
          borderRadius: '12px',
          padding: '1rem',
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spikeData}>
              <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                stroke="var(--text-muted)" 
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
              />
              <YAxis 
                domain={[0, 15]} 
                stroke="var(--text-muted)"
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}
              />
              <ReferenceLine y={8} stroke="var(--neon-orange)" strokeDasharray="4 4" label={{ value: 'Max', fill: 'var(--neon-orange)', fontSize: 10 }} />
              <ReferenceLine y={2} stroke="var(--neon-blue)" strokeDasharray="4 4" label={{ value: 'Min', fill: 'var(--neon-blue)', fontSize: 10 }} />
              <Line 
                type="monotone" 
                dataKey="temp" 
                stroke={severityColor} 
                strokeWidth={3}
                dot={{ fill: severityColor, r: 4 }}
                activeDot={{ r: 6, fill: severityColor }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Viability Status */}
      <div style={{
        background: 'var(--bg-glass)',
        padding: '1.25rem',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
        marginBottom: '1.5rem',
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
        }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Estimated Remaining Viability
          </span>
          <span style={{ 
            fontSize: '1.25rem', 
            fontWeight: 700, 
            color: remainingViability < 70 ? 'var(--neon-red)' : remainingViability < 85 ? 'var(--neon-orange)' : 'var(--neon-green)',
          }}>
            {remainingViability}%
          </span>
        </div>
        <div style={{
          height: '8px',
          background: 'var(--border-subtle)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${remainingViability}%`,
            height: '100%',
            background: remainingViability < 70 ? 'var(--neon-red)' : remainingViability < 85 ? 'var(--neon-orange)' : 'var(--neon-green)',
            borderRadius: '4px',
            transition: 'width 0.5s ease',
          }} />
        </div>
        {remainingViability < 70 && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.75rem',
            background: 'var(--neon-red)20',
            border: '1px solid var(--neon-red)',
            borderRadius: '8px',
            color: 'var(--neon-red)',
            fontSize: '0.875rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            🚫 <strong>Quarantine Recommended</strong> - Product viability critically compromised
          </div>
        )}
      </div>

      {/* AI Explanation Panel */}
      <div style={{
        background: 'linear-gradient(135deg, var(--neon-red)15, var(--neon-orange)15)',
        border: `1px solid ${severityColor}`,
        borderRadius: '12px',
        padding: '1.5rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: `linear-gradient(135deg, ${severityColor}, var(--neon-orange))`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
          }}>
            🤖
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              AI Breach Analysis
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Cold Chain Intelligence Engine
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ 
            fontSize: '0.75rem', 
            color: severityColor, 
            marginBottom: '0.5rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px',
            fontWeight: 600,
          }}>
            🔍 Root Cause
          </div>
          <div style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
            {aiExp.cause}
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ 
            fontSize: '0.75rem', 
            color: severityColor, 
            marginBottom: '0.5rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px',
            fontWeight: 600,
          }}>
            ⚠️ Risk Assessment
          </div>
          <div style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
            {aiExp.risk}
          </div>
        </div>

        <div>
          <div style={{ 
            fontSize: '0.75rem', 
            color: severityColor, 
            marginBottom: '0.5rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px',
            fontWeight: 600,
          }}>
            ✅ Recommended Actions
          </div>
          <div style={{ 
            fontSize: '0.9375rem', 
            color: 'var(--text-primary)', 
            lineHeight: 1.8,
            whiteSpace: 'pre-line',
            background: 'var(--bg-card)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
          }}>
            {aiExp.action}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginTop: '1.5rem',
      }}>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: '0.875rem',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            color: 'var(--text-secondary)',
            fontSize: '0.9375rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Close
        </button>
        <button
          style={{
            flex: 1,
            padding: '0.875rem',
            background: `linear-gradient(135deg, ${severityColor}, var(--neon-orange))`,
            border: 'none',
            borderRadius: '10px',
            color: 'white',
            fontSize: '0.9375rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Acknowledge Alert
        </button>
      </div>
    </div>
  );
};

export default AlertDetail;
