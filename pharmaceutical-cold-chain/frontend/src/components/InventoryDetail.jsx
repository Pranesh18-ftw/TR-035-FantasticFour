import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import '../styles/futuristic.css';

const InventoryDetail = ({ item, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!item) return null;

  // Generate mock temperature history
  const tempHistory = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    temp: 4 + Math.sin(i / 3) * 2 + (Math.random() - 0.5) * 1.5,
    safeMin: 2,
    safeMax: 8,
  }));

  // Determine risk level based on viability
  const getRiskLevel = () => {
    const viability = item.current_viability || item.viability || 100;
    if (viability >= 95) return { level: 'SAFE', color: 'var(--neon-green)', icon: '✓' };
    if (viability >= 80) return { level: 'WARNING', color: 'var(--neon-orange)', icon: '⚠' };
    return { level: 'CRITICAL', color: 'var(--neon-red)', icon: '🔴' };
  };

  const risk = getRiskLevel();
  const viability = item.current_viability || item.viability || 100;

  // AI recommendation based on risk
  const getAIRecommendation = () => {
    if (risk.level === 'SAFE') {
      return {
        storage: 'Maintain current cold storage conditions (2-8°C).',
        risk: 'No immediate risk detected. Product stability within acceptable range.',
        action: 'Continue standard monitoring protocols.'
      };
    } else if (risk.level === 'WARNING') {
      return {
        storage: 'Monitor closely. Consider relocating to more stable storage unit.',
        risk: 'Moderate viability loss detected. May affect shelf life.',
        action: 'Increase monitoring frequency. Prepare backup inventory.'
      };
    } else {
      return {
        storage: 'IMMEDIATE: Move to quarantine area. Do not distribute.',
        risk: 'Critical viability loss. Product may be compromised.',
        action: '1. Isolate immediately\n2. Notify quality assurance\n3. Document for compliance\n4. Arrange disposal'
      };
    }
  };

  const aiRec = getAIRecommendation();

  return (
    <div>
      {/* Header Info */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            background: risk.color + '20',
            border: `2px solid ${risk.color}`,
            color: risk.color,
            fontWeight: 'bold',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span>{risk.icon}</span>
            <span>{risk.level}</span>
          </div>
          {viability < 80 && (
            <div style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              background: 'var(--neon-red)20',
              border: '2px solid var(--neon-red)',
              color: 'var(--neon-red)',
              fontWeight: 'bold',
              fontSize: '0.875rem',
            }}>
              🚫 QUARANTINE RECOMMENDED
            </div>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          marginBottom: '1rem',
        }}>
          <div style={{
            background: 'var(--bg-glass)',
            padding: '1rem',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              BATCH NUMBER
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {item.batch_number}
            </div>
          </div>
          <div style={{
            background: 'var(--bg-glass)',
            padding: '1rem',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              QUANTITY
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {item.quantity} units
            </div>
          </div>
          <div style={{
            background: 'var(--bg-glass)',
            padding: '1rem',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              STORAGE UNIT
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {item.storage_unit}
            </div>
          </div>
          <div style={{
            background: 'var(--bg-glass)',
            padding: '1rem',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              EXPIRY DATE
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {item.expiry_date}
            </div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-glass)',
          padding: '1rem',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1rem',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            VIABILITY STATUS
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem'
          }}>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 700, 
              color: viability > 80 ? 'var(--neon-green)' : viability > 60 ? 'var(--neon-orange)' : 'var(--neon-red)',
            }}>
              {viability}%
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                height: '8px',
                background: 'var(--border-subtle)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${viability}%`,
                  height: '100%',
                  background: viability > 80 ? 'var(--neon-green)' : viability > 60 ? 'var(--neon-orange)' : 'var(--neon-red)',
                  borderRadius: '4px',
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        {['overview', 'analytics', 'ai-insights'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeTab === tab ? 'var(--bg-glass)' : 'transparent',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab ? 'var(--neon-blue)' : 'transparent'}`,
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            24-Hour Temperature History
          </h3>
          <div style={{ height: '200px', marginBottom: '1.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tempHistory}>
                <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  stroke="var(--text-muted)" 
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                />
                <YAxis 
                  domain={[0, 12]} 
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
                <ReferenceArea y1={2} y2={8} fill="var(--neon-green)" fillOpacity={0.1} />
                <Line 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="var(--neon-cyan)" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
          }}>
            <div style={{
              background: 'var(--bg-glass)',
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                OPTIMAL TEMP RANGE
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--neon-green)' }}>
                {item.optimal_temp_min}°C - {item.optimal_temp_max}°C
              </div>
            </div>
            <div style={{
              background: 'var(--bg-glass)',
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                FACILITY
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {item.facility_id}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              background: 'var(--bg-glass)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>98.5%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Uptime</div>
            </div>
            <div style={{
              background: 'var(--bg-glass)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌡️</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>4.2°C</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Temp</div>
            </div>
            <div style={{
              background: 'var(--bg-glass)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏱️</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>12d</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Shelf Life</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai-insights' && (
        <div>
          <div style={{
            background: 'linear-gradient(135deg, var(--neon-blue)20, var(--neon-cyan)20)',
            border: '1px solid var(--neon-blue)',
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
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-cyan))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
              }}>
                🤖
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  AI Analysis
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Powered by Cold Chain Intelligence
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--neon-cyan)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Storage Guidance
              </div>
              <div style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {aiRec.storage}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--neon-cyan)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Risk Assessment
              </div>
              <div style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {aiRec.risk}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--neon-cyan)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Recommended Actions
              </div>
              <div style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                {aiRec.action}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDetail;
