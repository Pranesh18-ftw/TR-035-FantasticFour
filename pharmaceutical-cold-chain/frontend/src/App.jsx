import { useState, useEffect } from 'react'
import './App.css'
import './styles/futuristic.css'
import { ThemeProvider } from './contexts/ThemeContext'
import ControlCenter from './components/ControlCenter'
import Dashboard from './components/Dashboard'
import Monitoring from './components/Monitoring'
import Inventory from './components/Inventory'
import Reports from './components/Reports'
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

      {/* Loading & Error States */}
      {loading && (
        <div style={{ background: 'var(--neon-blue)', color: 'white', padding: '0.5rem 1rem', textAlign: 'center' }}>
          ⏳ Loading data from backend... (WebSocket: {isConnected ? '✅' : '❌'})
        </div>
      )}
      {error && (
        <div style={{ background: 'var(--neon-red)', color: 'white', padding: '0.5rem 1rem', textAlign: 'center' }}>
          ⚠️ {error} | Sensors: {sensorData.length} | Inventory: {inventory.length}
        </div>
      )}
      
      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'dashboard' && (
          <ControlCenter 
            sensorData={sensorData} 
            breaches={breaches} 
            wsConnected={isConnected}
            inventory={inventory}
            metrics={metrics}
          />
        )}
        {activeTab === 'monitoring' && (
          <Monitoring 
            sensorData={sensorData} 
            breaches={breaches} 
            inventory={inventory}
          />
        )}
        {activeTab === 'inventory' && (
          <Inventory 
            initialInventory={inventory}
          />
        )}
        {activeTab === 'reports' && (
          <Reports 
            complianceReport={complianceReport}
            metrics={metrics}
            breaches={breaches}
            inventory={inventory}
          />
        )}
      </main>
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
