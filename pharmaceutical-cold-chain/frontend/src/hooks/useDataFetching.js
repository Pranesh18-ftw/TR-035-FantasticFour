import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8002';

export const useDataFetching = () => {
  const [inventory, setInventory] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [complianceReport, setComplianceReport] = useState(null);
  const [sensorData, setSensorData] = useState([]);
  const [breaches, setBreaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data in parallel
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        axios.get(`${API_URL}/api/inventory`),
        axios.get(`${API_URL}/api/metrics`),
        axios.get(`${API_URL}/api/compliance/report`),
        axios.get(`${API_URL}/api/sensors/current`),
        axios.get(`${API_URL}/api/breach/active`),
      ]);

      // Inventory
      if (results[0].status === 'fulfilled') {
        const mappedInventory = results[0].value.data.inventory?.map(item => ({
          ...item,
          current_viability: item.viability || item.current_viability || 100
        })) || [];
        setInventory(mappedInventory);
      }

      // Metrics
      if (results[1].status === 'fulfilled') {
        setMetrics(results[1].value.data.metrics);
      }

      // Compliance Report
      if (results[2].status === 'fulfilled') {
        setComplianceReport(results[2].value.data.report);
      }

      // Sensor Data
      if (results[3].status === 'fulfilled') {
        setSensorData(results[3].value.data.readings || []);
      }

      // Breaches
      if (results[4].status === 'fulfilled') {
        setBreaches(results[4].value.data.breaches || []);
      }

      // Check if any failed
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        console.warn('Some endpoints failed:', failed.map(f => f.reason?.message));
      }

    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      console.error('Data fetching error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAllData();
    
    // Refresh every 5 seconds
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  return {
    inventory,
    metrics,
    complianceReport,
    sensorData,
    breaches,
    loading,
    error,
    refetch: fetchAllData,
  };
};

export default useDataFetching;
