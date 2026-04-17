import React from 'react';

const Layout = ({ 
  children, 
  activeTab, 
  onTabChange,
  isConnected,
  hasActiveBreach,
  criticalCount,
  currentTime,
  loading,
  error,
  sensorData,
  inventory
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'monitoring', label: 'Monitoring', icon: '📡' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'reports', label: 'Reports', icon: '📈' },
  ];

  return (
    <div className="app-modern">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-modern">
            <div className="brand-icon">🌡️</div>
            <span>Cold Chain</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Main Menu</div>
            {navItems.map(item => (
              <div
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => onTabChange(item.id)}
              >
                <span className="nav-item-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.id === 'monitoring' && hasActiveBreach && (
                  <span style={{ 
                    marginLeft: 'auto', 
                    background: 'var(--danger-500)', 
                    color: 'white',
                    fontSize: '0.7rem',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontWeight: 'bold'
                  }}>
                    {criticalCount || '!'}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="nav-section">
            <div className="nav-section-title">System Status</div>
            <div className="nav-item" style={{ cursor: 'default' }}>
              <span className="nav-item-icon">{isConnected ? '🟢' : '🔴'}</span>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="nav-item" style={{ cursor: 'default' }}>
              <span className="nav-item-icon">📡</span>
              <span>{sensorData.length} Sensors Active</span>
            </div>
            <div className="nav-item" style={{ cursor: 'default' }}>
              <span className="nav-item-icon">📦</span>
              <span>{inventory.length} Items in Stock</span>
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">OP</div>
            <div className="user-details">
              <div className="user-name">Operator</div>
              <div className="user-role">System Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <h1 className="page-title">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
          <div className="header-actions">
            {loading && (
              <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                Loading...
              </span>
            )}
            {error && (
              <span style={{ color: 'var(--danger-600)', fontSize: '0.875rem' }}>
                ⚠️ Error
              </span>
            )}
            {hasActiveBreach && (
              <span className="status-badge danger">
                <span className="status-dot"></span>
                {criticalCount} Critical Alert{criticalCount !== 1 ? 's' : ''}
              </span>
            )}
            <span style={{ 
              fontFamily: 'var(--font-mono)', 
              color: 'var(--gray-600)',
              fontSize: '0.875rem'
            }}>
              {currentTime.toLocaleTimeString('en-US', { hour12: false })}
            </span>
          </div>
        </header>

        {/* Content Area */}
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
