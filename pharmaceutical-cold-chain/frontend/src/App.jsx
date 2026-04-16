import { useState, useEffect } from 'react'
import './App.css'
import Dashboard from './components/Dashboard'
import Monitoring from './components/Monitoring'
import Inventory from './components/Inventory'
import Reports from './components/Reports'
import { useWebSocket } from './hooks/useWebSocket'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [currentTime, setCurrentTime] = useState(new Date())
  const { sensorData, breaches, isConnected } = useWebSocket('ws://localhost:8002/ws')

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

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'dashboard' && <Dashboard sensorData={sensorData} breaches={breaches} />}
        {activeTab === 'monitoring' && <Monitoring sensorData={sensorData} breaches={breaches} />}
        {activeTab === 'inventory' && <Inventory />}
        {activeTab === 'reports' && <Reports />}
      </main>
    </div>
  )
}

export default App
