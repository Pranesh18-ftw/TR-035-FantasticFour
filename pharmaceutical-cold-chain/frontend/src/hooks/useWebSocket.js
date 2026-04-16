import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebSocket = (url) => {
  const [sensorData, setSensorData] = useState([]);
  const [breaches, setBreaches] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected', 'network-error'
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const lastDataTime = useRef(Date.now());

  const connect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    
    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket Connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
        lastDataTime.current = Date.now();
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          lastDataTime.current = Date.now();
          
          if (data.type === 'sensor_update') {
            // Check for empty readings (network loss simulation)
            if (data.readings && data.readings.length > 0) {
              setSensorData(data.readings);
            } else {
              setConnectionStatus('network-error');
            }
            
            if (data.breaches && data.breaches.length > 0) {
              setBreaches(prev => [...data.breaches, ...prev].slice(0, 50));
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          setConnectionStatus('network-error');
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket Disconnected', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Attempt reconnection if not a normal closure
        if (event.code !== 1000) {
          handleReconnection();
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket Error:', error);
        setIsConnected(false);
        setConnectionStatus('network-error');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setIsConnected(false);
    }
  }, [url]);

  // Reconnection logic
  const handleReconnection = useCallback(() => {
    if (reconnectAttempts.current < maxReconnectAttempts) {
      reconnectAttempts.current++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
      console.log(`Attempting reconnection ${reconnectAttempts.current}/${maxReconnectAttempts} in ${delay}ms`);
      
      reconnectTimeout.current = setTimeout(() => {
        connect();
      }, delay);
    }
  }, [connect, maxReconnectAttempts]);

  // Update onclose to handle reconnection
  useEffect(() => {
    if (ws.current) {
      ws.current.onclose = (event) => {
        console.log('WebSocket Disconnected', event.code, event.reason);
        setIsConnected(false);
        
        // Attempt reconnection if not a normal closure
        if (event.code !== 1000) {
          handleReconnection();
        }
      };
    }
  }, [handleReconnection]);

  useEffect(() => {
    const cleanup = () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close(1000, 'Component unmounted');
      }
    };

    // Use setTimeout to avoid calling setState synchronously
    setTimeout(connect, 0);
    
    return cleanup;
  }, [url, connect, handleReconnection]);

  return { sensorData, breaches, isConnected, connectionStatus };
};
