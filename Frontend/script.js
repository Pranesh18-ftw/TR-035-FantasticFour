// API Base URL
const API_URL = 'http://localhost:8001';

// State
let isMonitoring = false;
let updateInterval = null;
let currentMode = 'simulation';
let isConnected = true;

// DOM Elements
const statusBadge = document.getElementById('statusBadge');
const statusDot = statusBadge.querySelector('.status-dot');
const statusText = document.getElementById('statusText');
const currentTemp = document.getElementById('currentTemp');
const currentModeEl = document.getElementById('currentMode');
const breachCount = document.getElementById('breachCount');
const todayBreachesEl = document.getElementById('todayBreaches');
const breachesList = document.getElementById('breachesList');
const breachBadge = document.getElementById('breachBadge');
const logsContainer = document.getElementById('logsContainer');
const tempInput = document.getElementById('tempInput');
const inputCard = document.getElementById('inputCard');
const connectionStatus = document.getElementById('connectionStatus');
const connectionDot = connectionStatus.querySelector('.connection-dot');
const connectionText = connectionStatus.querySelector('.connection-text');
const lastUpdate = document.getElementById('lastUpdate');
const gaugeFill = document.getElementById('gaugeFill');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchStatus();
    fetchConfig();
    setupEventListeners();
    startConnectionCheck();
});

// Setup Event Listeners
function setupEventListeners() {
    document.getElementById('startBtn').addEventListener('click', startMonitoring);
    document.getElementById('stopBtn').addEventListener('click', stopMonitoring);
    document.getElementById('resetBtn').addEventListener('click', resetMonitoring);
    document.getElementById('simModeBtn').addEventListener('click', () => switchMode('simulation'));
    document.getElementById('manualModeBtn').addEventListener('click', () => switchMode('manual'));
    document.getElementById('submitTempBtn').addEventListener('click', submitTemperature);
    document.getElementById('clearLogsBtn').addEventListener('click', clearLogs);
    
    tempInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitTemperature();
        }
    });
}

// Connection Check
function startConnectionCheck() {
    setInterval(checkConnection, 10000);
}

async function checkConnection() {
    try {
        const response = await fetch(`${API_URL}/`);
        if (response.ok) {
            if (!isConnected) {
                isConnected = true;
                connectionDot.classList.remove('disconnected');
                connectionText.textContent = 'Connected';
            }
        }
    } catch (error) {
        if (isConnected) {
            isConnected = false;
            connectionDot.classList.add('disconnected');
            connectionText.textContent = 'Disconnected';
        }
    }
}

// Fetch Functions
async function fetchStatus() {
    try {
        const response = await fetch(`${API_URL}/status`);
        const data = await response.json();
        updateStatusDisplay(data);
        updateLastUpdate();
    } catch (error) {
        console.error('Error fetching status:', error);
        if (isConnected) {
            isConnected = false;
            connectionDot.classList.add('disconnected');
            connectionText.textContent = 'Disconnected';
        }
    }
}

async function fetchBreaches() {
    try {
        const response = await fetch(`${API_URL}/breaches`);
        const data = await response.json();
        updateBreachesDisplay(data);
    } catch (error) {
        console.error('Error fetching breaches:', error);
    }
}

async function fetchLogs() {
    try {
        const response = await fetch(`${API_URL}/logs`);
        const data = await response.json();
        updateLogsDisplay(data);
    } catch (error) {
        console.error('Error fetching logs:', error);
    }
}

async function fetchConfig() {
    try {
        const response = await fetch(`${API_URL}/config`);
        const data = await response.json();
        document.getElementById('configRange').textContent = `${data.min_temp}°C - ${data.max_temp}°C`;
    } catch (error) {
        console.error('Error fetching config:', error);
    }
}

// Display Updates
function updateStatusDisplay(data) {
    // Update temperature
    currentTemp.textContent = data.current_temp ? data.current_temp.toFixed(1) : '--';
    
    // Update gauge
    if (data.current_temp) {
        updateGauge(data.current_temp);
    }
    
    // Update status
    statusText.textContent = data.status;
    statusBadge.classList.remove('safe', 'breach');
    if (data.status === 'SAFE') {
        statusBadge.classList.add('safe');
    } else if (data.status === 'BREACH') {
        statusBadge.classList.add('breach');
    }
    
    // Update mode
    currentModeEl.textContent = data.mode.toUpperCase();
    currentMode = data.mode;
    
    // Update mode buttons
    document.getElementById('simModeBtn').classList.toggle('active', data.mode === 'simulation');
    document.getElementById('manualModeBtn').classList.toggle('active', data.mode === 'manual');
    
    // Update breach count
    breachCount.textContent = data.breach_count;
    todayBreachesEl.textContent = data.breach_count;
    
    // Update breach badge
    breachBadge.textContent = `${data.breach_count} breach${data.breach_count !== 1 ? 'es' : ''}`;
    
    // Show/hide manual input card
    inputCard.style.display = data.mode === 'manual' ? 'block' : 'none';
}

function updateGauge(temperature) {
    // Map temperature to percentage (-5 to 15 range)
    const minTemp = -5;
    const maxTemp = 15;
    const percentage = ((temperature - minTemp) / (maxTemp - minTemp)) * 100;
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    
    gaugeFill.style.left = `${clampedPercentage}%`;
}

function updateLastUpdate() {
    const now = new Date();
    lastUpdate.textContent = `Last update: ${now.toLocaleTimeString()}`;
}

function updateBreachesDisplay(data) {
    if (data.breaches.length === 0) {
        breachesList.innerHTML = `
            <div class="no-data">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <p>No breaches detected</p>
            </div>
        `;
        return;
    }
    
    breachesList.innerHTML = data.breaches
        .reverse()
        .map(breach => `
            <div class="breach-item ${breach.severity}">
                <div class="breach-time">${new Date(breach.timestamp).toLocaleString()}</div>
                <div class="breach-message">${breach.message}</div>
            </div>
        `)
        .join('');
}

function updateLogsDisplay(data) {
    if (data.logs.length === 0) {
        logsContainer.innerHTML = `
            <div class="no-data">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                </svg>
                <p>No logs available</p>
            </div>
        `;
        return;
    }
    
    logsContainer.innerHTML = data.logs
        .reverse()
        .map(log => {
            const logType = log.includes('HIGH') ? 'error' : log.includes('WARNING') ? 'warning' : 'info';
            return `<div class="log-item ${logType}">${log}</div>`;
        })
        .join('');
}

function clearLogs() {
    logsContainer.innerHTML = `
        <div class="no-data">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p>No logs available</p>
        </div>
    `;
}

// Control Functions
async function startMonitoring() {
    try {
        const response = await fetch(`${API_URL}/start`, { method: 'POST' });
        const data = await response.json();
        console.log(data.message);
        
        if (!isMonitoring) {
            isMonitoring = true;
            updateInterval = setInterval(() => {
                fetchStatus();
                fetchBreaches();
                fetchLogs();
            }, 5000);
        }
    } catch (error) {
        console.error('Error starting monitoring:', error);
    }
}

async function stopMonitoring() {
    try {
        const response = await fetch(`${API_URL}/stop`, { method: 'POST' });
        const data = await response.json();
        console.log(data.message);
        
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }
        isMonitoring = false;
    } catch (error) {
        console.error('Error stopping monitoring:', error);
    }
}

async function resetMonitoring() {
    try {
        const response = await fetch(`${API_URL}/reset`, { method: 'POST' });
        const data = await response.json();
        console.log(data.message);
        fetchStatus();
        fetchBreaches();
        fetchLogs();
    } catch (error) {
        console.error('Error resetting monitoring:', error);
    }
}

async function switchMode(mode) {
    try {
        const response = await fetch(`${API_URL}/mode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode })
        });
        const data = await response.json();
        console.log(data.message);
        fetchStatus();
    } catch (error) {
        console.error('Error switching mode:', error);
    }
}

async function submitTemperature() {
    const temperature = parseFloat(tempInput.value);
    if (isNaN(temperature)) {
        alert('Please enter a valid temperature');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/temperature`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ temperature })
        });
        const data = await response.json();
        console.log(data.message);
        tempInput.value = '';
        fetchStatus();
        fetchBreaches();
        fetchLogs();
    } catch (error) {
        console.error('Error submitting temperature:', error);
    }
}
