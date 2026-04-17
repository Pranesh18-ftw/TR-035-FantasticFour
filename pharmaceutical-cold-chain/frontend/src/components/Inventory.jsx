import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AIDrugSuggestions from './AIDrugSuggestions';

const API_URL = 'http://localhost:8002';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newItem, setNewItem] = useState({
    drug_name: '',
    batch_number: '',
    quantity: '',
    storage_unit: '',
    facility_id: '',
    optimal_temp_min: 2,
    optimal_temp_max: 8,
    expiry_date: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/inventory`);
      setInventory(response.data.inventory);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      // Ensure quantity is an integer
      const itemToSend = {
        ...newItem,
        quantity: parseInt(newItem.quantity) || 0,
        optimal_temp_min: parseFloat(newItem.optimal_temp_min) || 2,
        optimal_temp_max: parseFloat(newItem.optimal_temp_max) || 8
      };
      await axios.post(`${API_URL}/api/inventory`, itemToSend);
      setShowAddForm(false);
      setNewItem({
        drug_name: '',
        batch_number: '',
        quantity: '',
        storage_unit: '',
        facility_id: '',
        optimal_temp_min: 2,
        optimal_temp_max: 8,
        expiry_date: ''
      });
      fetchInventory();
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSelectDrug = (drug) => {
    // Generate sample data for demo purposes
    const batchNumber = `BATCH-${Math.floor(Math.random() * 9000) + 1000}`;
    const quantity = Math.floor(Math.random() * 500) + 50;
    const facilities = ['FAC_1', 'FAC_2', 'FAC_3'];
    const storageUnits = ['COLD_STORE_1', 'COLD_STORE_2', 'COLD_STORE_3', 'PORTABLE_1'];
    const facilityId = facilities[Math.floor(Math.random() * facilities.length)];
    const storageUnit = storageUnits[Math.floor(Math.random() * storageUnits.length)];
    
    // Generate expiry date 6-24 months in the future
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + Math.floor(Math.random() * 18) + 6);
    const expiryDateStr = expiryDate.toISOString().split('T')[0];
    
    setNewItem({
      drug_name: drug.name,
      batch_number: batchNumber,
      quantity: quantity,
      storage_unit: storageUnit,
      facility_id: facilityId,
      optimal_temp_min: drug.temp_min || 2,
      optimal_temp_max: drug.temp_max || 8,
      expiry_date: expiryDateStr
    });
    setShowAISuggestions(false);
    setShowAddForm(true);
  };

  const handleAddCustomDrug = () => {
    setShowAISuggestions(false);
    setShowAddForm(true);
  };

  const getStatusBadge = (status, viability) => {
    if (status === 'quarantined') return <span className="badge quarantined">QUARANTINED</span>;
    if (viability < 60) return <span className="badge at-risk">AT RISK</span>;
    if (viability < 80) return <span className="badge monitor">MONITOR</span>;
    return <span className="badge safe">SAFE</span>;
  };

  if (loading) return (
    <div className="dashboard-container">
      <div className="loading-container">
        <div className="spinner"></div>
        <span>Loading inventory...</span>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div className="panel-header">
          <div className="panel-title">
            <span>📦</span> Pharmaceutical Inventory
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="🔍 Search drugs for AI suggestions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowAISuggestions(true)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                width: '300px'
              }}
            />
            <button 
              className="btn-primary" 
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Cancel' : '+ Add Item'}
            </button>
          </div>
        </div>
      </div>

      {/* AI Drug Suggestions */}
      {showAISuggestions && (
        <AIDrugSuggestions
          query={searchQuery}
          onSelect={handleSelectDrug}
          onAddNew={handleAddCustomDrug}
        />
      )}

      {/* Add Item Form */}
      {showAddForm && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <div className="panel-header">
            <div className="panel-title">Add New Inventory Item</div>
          </div>
          <form onSubmit={handleAddItem}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <input
                type="text"
                placeholder="Drug Name"
                value={newItem.drug_name}
                onChange={(e) => setNewItem({...newItem, drug_name: e.target.value})}
                required
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '0.75rem',
                  borderRadius: '8px'
                }}
              />
              <input
                type="text"
                placeholder="Batch Number"
                value={newItem.batch_number}
                onChange={(e) => setNewItem({...newItem, batch_number: e.target.value})}
                required
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '0.75rem',
                  borderRadius: '8px'
                }}
              />
              <input
                type="number"
                placeholder="Quantity"
                value={newItem.quantity}
                onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                required
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '0.75rem',
                  borderRadius: '8px'
                }}
              />
              <input
                type="text"
                placeholder="Storage Unit"
                value={newItem.storage_unit}
                onChange={(e) => setNewItem({...newItem, storage_unit: e.target.value})}
                required
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '0.75rem',
                  borderRadius: '8px'
                }}
              />
              <input
                type="text"
                placeholder="Facility ID"
                value={newItem.facility_id}
                onChange={(e) => setNewItem({...newItem, facility_id: e.target.value})}
                required
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '0.75rem',
                  borderRadius: '8px'
                }}
              />
              <input
                type="date"
                placeholder="Expiry Date"
                value={newItem.expiry_date}
                onChange={(e) => setNewItem({...newItem, expiry_date: e.target.value})}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '0.75rem',
                  borderRadius: '8px'
                }}
              />
            </div>
            <button type="submit" className="btn-submit">Add Item</button>
          </form>
        </div>
      )}

      {/* Stats Cards */}
      <div className="metrics-section" style={{ marginBottom: '2rem' }}>
        <div className="metric-card success">
          <span className="metric-icon">📦</span>
          <div className="metric-label">Total Items</div>
          <div className="metric-value">{inventory.length}</div>
          <div className="metric-trend">In inventory</div>
        </div>
        <div className={`metric-card ${inventory.filter(i => i.status === 'quarantined').length > 0 ? 'critical' : 'success'}`}>
          <span className="metric-icon">🚫</span>
          <div className="metric-label">Quarantined</div>
          <div className={`metric-value ${inventory.filter(i => i.status === 'quarantined').length > 0 ? 'critical' : ''}`}>
            {inventory.filter(i => i.status === 'quarantined').length}
          </div>
          <div className="metric-trend">Cannot be used</div>
        </div>
        <div className={`metric-card ${inventory.filter(i => i.current_viability < 80).length > 0 ? 'warning' : 'success'}`}>
          <span className="metric-icon">⚠️</span>
          <div className="metric-label">At Risk</div>
          <div className={`metric-value ${inventory.filter(i => i.current_viability < 80).length > 0 ? 'warning' : ''}`}>
            {inventory.filter(i => i.current_viability < 80).length}
          </div>
          <div className="metric-trend">Viability &lt; 80%</div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="glass-card">
        <div className="panel-header">
          <div className="panel-title">
            <span>📋</span> Inventory List
          </div>
          <span className="panel-subtitle">{inventory.length} items</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Drug Name</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Batch #</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Qty</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Location</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Viability</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{item.drug_name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{item.batch_number}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{item.quantity}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{item.storage_unit}</td>
                  <td style={{ padding: '1rem' }}>
                    <div className="viability-bar">
                      <div 
                        className="viability-fill" 
                        style={{
                          width: `${item.current_viability}%`, 
                          background: item.current_viability > 80 ? 'var(--accent-green)' : item.current_viability > 60 ? 'var(--accent-orange)' : 'var(--accent-red)'
                        }}
                      />
                      <span>{item.current_viability.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>{getStatusBadge(item.status, item.current_viability)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
