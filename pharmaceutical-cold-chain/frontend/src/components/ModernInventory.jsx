import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8002';

const ModernInventory = ({ inventory, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredInventory = inventory.filter(item => 
    item.drug_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.batch_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddItem = async (e) => {
    e.preventDefault();
    // Add item logic here
    setShowAddModal(false);
  };

  return (
    <div>
      {/* Header Actions */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 'var(--spacing-lg)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
            Inventory Management
          </h2>
          <p style={{ color: 'var(--gray-500)' }}>
            {inventory.length} items in stock • {inventory.filter(i => i.status === 'quarantined').length} quarantined
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          <input
            type="text"
            placeholder="Search drugs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-md)',
              border: '1px solid var(--gray-300)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              width: '240px'
            }}
          />
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            + Add Item
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Drug Name</th>
                  <th>Batch Number</th>
                  <th>Quantity</th>
                  <th>Storage Unit</th>
                  <th>Facility</th>
                  <th>Viability</th>
                  <th>Status</th>
                  <th>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(item => {
                  const viability = item.current_viability || item.viability || 100;
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 500 }}>{item.drug_name}</td>
                      <td>{item.batch_number}</td>
                      <td>{item.quantity}</td>
                      <td>{item.storage_unit}</td>
                      <td>{item.facility_id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                          <div style={{
                            width: '80px',
                            height: '8px',
                            background: 'var(--gray-200)',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${viability}%`,
                              height: '100%',
                              background: viability > 80 ? 'var(--success-500)' : viability > 60 ? 'var(--warning-500)' : 'var(--danger-500)',
                              borderRadius: '4px'
                            }} />
                          </div>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{viability.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${
                          item.status === 'quarantined' ? 'danger' : 
                          viability < 60 ? 'danger' : 
                          viability < 80 ? 'warning' : 'success'
                        }`}>
                          {item.status === 'quarantined' ? 'Quarantined' : 
                           viability < 60 ? 'At Risk' : 
                           viability < 80 ? 'Monitor' : 'Safe'}
                        </span>
                      </td>
                      <td>{item.expiry_date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredInventory.length === 0 && !loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: 'var(--spacing-2xl)',
          color: 'var(--gray-500)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📦</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: 'var(--spacing-sm)' }}>
            No items found
          </div>
          <div>Try adjusting your search or add new items to inventory</div>
        </div>
      )}
    </div>
  );
};

export default ModernInventory;
