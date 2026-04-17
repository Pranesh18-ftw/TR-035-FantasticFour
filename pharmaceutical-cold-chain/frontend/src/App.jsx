import { useState, useEffect } from 'react'
import './styles/modern.css'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import ModernDashboard from './components/ModernDashboard'
import ModernInventory from './components/ModernInventory'
import ModernReports from './components/ModernReports'
import ModernMonitoring from './components/ModernMonitoring'
import { useDataFetching } from './hooks/useDataFetching'
import { useWebSocket } from './hooks/useWebSocket'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Centralized data fetching from all backend endpoints
  const { 
    inventory, 
    metrics, 
    complianceReport, 
    sensorData: httpSensorData, 
    breaches: httpBreaches,
    loading,
    error
  } = useDataFetching()
  
  // WebSocket for real-time updates
  const { sensorData: wsSensorData, breaches: wsBreaches, isConnected } = useWebSocket('ws://localhost:8002/ws')

  // Combine HTTP and WebSocket data (WebSocket takes priority for real-time)
  const sensorData = wsSensorData.length > 0 ? wsSensorData : httpSensorData
  const breaches = wsBreaches.length > 0 ? wsBreaches : httpBreaches

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Check if there are active critical breaches
  const hasActiveBreach = breaches.some(b => b.status === 'active')
  const criticalCount = breaches.filter(b => b.severity === 'critical' && b.status === 'active').length

  return (
    <div className="app">
      {/* Futuristic Top Bar */}
      <header className="top-bar">
        <div className="brand">
          <span className="brand-icon">🌡️</span>
          <h1>Cold Chain Control System</h1>
        </div>
        
        <div className="status-area">
          {/* Connection Status */}
          <div className={`status-badge ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className={`status-dot ${hasActiveBreach ? 'breach' : ''}`}></span>
            <span>
              {hasActiveBreach 
                ? `🔴 ${criticalCount > 0 ? `${criticalCount} Critical` : 'Breach Active'}` 
                : '🟢 Connected'}
            </span>
          </div>
          
          {/* Live Clock */}
          <div className="live-clock">
            {currentTime.toLocaleTimeString('en-US', { hour12: false })}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="nav-tabs" style={{ 
        background: 'var(--bg-secondary)', 
        padding: '0.5rem 2rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''} 
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={activeTab === 'monitoring' ? 'active' : ''} 
          onClick={() => setActiveTab('monitoring')}
        >
          📡 Monitoring
        </button>
        <button 
          className={activeTab === 'inventory' ? 'active' : ''} 
          onClick={() => setActiveTab('inventory')}
        >
          📦 Inventory
        </button>
        <button 
          className={activeTab === 'reports' ? 'active' : ''} 
          onClick={() => setActiveTab('reports')}
        >
          📈 Reports
        </button>
      </nav>

      <Layout 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isConnected={isConnected}
        hasActiveBreach={hasActiveBreach}
        criticalCount={criticalCount}
        currentTime={currentTime}
        loading={loading}
        error={error}
        sensorData={sensorData}
        inventory={inventory}
      >
        {activeTab === 'dashboard' && (
          <ModernDashboard 
            sensorData={sensorData} 
            breaches={breaches} 
            inventory={inventory}
            metrics={metrics}
            wsConnected={isConnected}
          />
        )}
        {activeTab === 'monitoring' && (
          <ModernMonitoring 
            sensorData={sensorData} 
            breaches={breaches} 
            inventory={inventory}
          />
        )}
        {activeTab === 'inventory' && (
          <ModernInventory 
            inventory={inventory}
            loading={loading}
          />
        )}
        {activeTab === 'reports' && (
          <ModernReports 
            complianceReport={complianceReport}
            metrics={metrics}
            breaches={breaches}
            inventory={inventory}
          />
        )}
      </Layout>
    </div>
  )
}

// Wrap App with ThemeProvider
function AppWithTheme() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )
}

export default AppWithTheme
