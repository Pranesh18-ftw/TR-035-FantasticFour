import React, { useState, useEffect } from 'react';
import './AIDrugSuggestions.css';

const AIDrugSuggestions = ({ query, onSelect, onAddNew }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (query.length >= 2) {
      fetchSuggestions();
    } else {
      fetchDefaultSuggestions();
    }
  }, [query]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8002/api/inventory/drug-suggestions?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDefaultSuggestions = async () => {
    try {
      const response = await fetch('http://localhost:8002/api/inventory/drug-suggestions');
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching default suggestions:', error);
      setSuggestions([]);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Vaccine': '#22c55e',
      'Antibiotic': '#3b82f6',
      'Hormone': '#ec4899',
      'Chemotherapy': '#ef4444',
      'Blood Product': '#dc2626',
      'Biologic': '#8b5cf6',
      'Enzyme': '#f59e0b',
      'Vitamin': '#06b6d4',
      'Emergency Drug': '#f97316'
    };
    return colors[category] || '#6b7280';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Vaccine': '💉',
      'Antibiotic': '🦠',
      'Hormone': '🧬',
      'Chemotherapy': '⚗️',
      'Blood Product': '🩸',
      'Biologic': '🔬',
      'Enzyme': '🧪',
      'Vitamin': '💊',
      'Emergency Drug': '🚨'
    };
    return icons[category] || '💊';
  };

  const displayedSuggestions = showAll ? suggestions : suggestions.slice(0, 4);

  return (
    <div className="ai-suggestions">
      <div className="suggestions-header">
        <h4>🤖 AI-Powered Drug Suggestions</h4>
        {suggestions.length > 4 && (
          <button 
            className="show-more-btn"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show All (${suggestions.length})`}
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-suggestions">
          <div className="spinner"></div>
          <span>AI is thinking...</span>
        </div>
      ) : (
        <div className="suggestions-grid">
          {displayedSuggestions.map((drug, index) => (
            <div 
              key={index}
              className="drug-suggestion-card"
              onClick={() => onSelect(drug)}
            >
              <div className="drug-header">
                <div className="drug-icon">
                  {getCategoryIcon(drug.category)}
                </div>
                <div className="drug-info">
                  <h5>{drug.name}</h5>
                  <span 
                    className="category-badge"
                    style={{ backgroundColor: getCategoryColor(drug.category) }}
                  >
                    {drug.category}
                  </span>
                </div>
              </div>

              <div className="drug-description">
                {drug.description}
              </div>

              <div className="temperature-range">
                <div className="temp-label">Storage Temperature:</div>
                <div className="temp-values">
                  <span className="temp-min">{drug.temp_min}°C</span>
                  <span className="temp-separator">to</span>
                  <span className="temp-max">{drug.temp_max}°C</span>
                </div>
              </div>

              {drug.storage_notes && (
                <div className="storage-notes">
                  <div className="notes-label">💡 Storage Notes:</div>
                  <div className="notes-content">{drug.storage_notes}</div>
                </div>
              )}

              <div className="card-actions">
                <button className="select-btn">
                  ✓ Select This Drug
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="add-custom-section">
        <div className="custom-header">
          <h5>🔬 Add Custom Drug</h5>
          <p>Don't see your drug? Add it manually with AI validation</p>
        </div>
        <button 
          className="add-custom-btn"
          onClick={onAddNew}
        >
          + Add Custom Drug
        </button>
      </div>

      <div className="ai-disclaimer">
        <div className="disclaimer-icon">ℹ️</div>
        <div className="disclaimer-text">
          <strong>AI-Powered Suggestions:</strong> These recommendations are generated by AI 
          based on common pharmaceutical storage requirements. Always verify with official 
          drug documentation and regulatory guidelines.
        </div>
      </div>
    </div>
  );
};

export default AIDrugSuggestions;
