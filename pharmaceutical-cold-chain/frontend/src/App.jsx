import { useState, useEffect } from 'react'
import './App.css'
import Dashboard from './components/Dashboard'
import Monitoring from './components/Monitoring'
import Inventory from './components/Inventory'
import Reports from './components/Reports'
import { useWebSocket } from './hooks/useWebSocket'

const API_URL = 'http://localhost:8002'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [initialSensorData, setInitialSensorData] = useState([])
  const [initialBreaches, setInitialBreaches] = useState([])
  const [apiError, setApiError] = useState(null)
  const { sensorData: wsSensorData, breaches: wsBreaches, isConnected } = useWebSocket('ws://localhost:8002/ws')

  // Fetch initial data via HTTP
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        console.log('Fetching from:', `${API_URL}/api/sensors/current`)
        const response = await fetch(`${API_URL}/api/sensors/current`)
        console.log('Response status:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('Data received:', data.readings?.length, 'readings')
          setInitialSensorData(data.readings || [])
          setApiError(null)
        } else {
          setApiError(`API Error: ${response.status}`)
        }
      } catch (error) {
        console.error('Failed to fetch initial sensor data:', error)
        setApiError(`Fetch Error: ${error.message}`)
      }
    }
    
    fetchInitialData()
    // Refresh every 5 seconds as fallback
    const interval = setInterval(fetchInitialData, 5000)
    return () => clearInterval(interval)
  }, [])

  // Combine WebSocket and HTTP data
  const sensorData = wsSensorData.length > 0 ? wsSensorData : initialSensorData
  const breaches = wsBreaches.length > 0 ? wsBreaches : initialBreaches

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

      {/* Debug Info */}
      {apiError && (
        <div style={{ background: '#ef4444', color: 'white', padding: '0.5rem 1rem', textAlign: 'center' }}>
          ⚠️ {apiError} | Data: {sensorData.length} readings
        </div>
      )}
      {!apiError && sensorData.length === 0 && (
        <div style={{ background: '#f97316', color: 'white', padding: '0.5rem 1rem', textAlign: 'center' }}>
          ⏳ Loading data from API... (WebSocket: {isConnected ? '✅' : '❌'})
        </div>
      )}
      
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
