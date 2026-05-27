import React, { useState } from 'react';

const FlightSearchPanel = ({
  searchCode, setSearchCode, onSearchCode,
  searchCarrier, setSearchCarrier, onSearchCarrier,
  searchSource, setSearchSource,
  searchDestination, setSearchDestination, onSearchRoute,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice, onSearchPriceRange,
  onReset
}) => {
  const [activeTab, setActiveTab] = useState('code'); // 'code' | 'carrier' | 'route' | 'price'

  const tabs = [
    { id: 'code', label: 'CODE' },
    { id: 'carrier', label: 'CARRIER' },
    { id: 'route', label: 'ROUTE' },
    { id: 'price', label: 'PRICE RANGE' }
  ];

  return (
    <div className="liquid-glass" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="hud-title" style={{ fontSize: '1.1rem' }}>
          <span style={{ fontSize: '1.1rem' }}>🔍</span>
          INTELLIGENT MANIFEST SEARCH
        </h3>
        <button
          onClick={onReset}
          className="liquid-button"
          style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          RESET SEARCH
        </button>
      </div>

      {/* Capsule Tab Switcher */}
      <div style={{
        display: 'flex',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '12px',
        padding: '3px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        width: '100%'
      }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 100%)' : 'transparent',
                boxShadow: isActive ? 'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 4px 10px rgba(0, 0, 0, 0.2)' : 'none',
                color: isActive ? 'var(--primary-glow)' : 'var(--text-secondary)',
                borderRadius: '9px',
                padding: '8px 0',
                fontSize: '0.7rem',
                fontWeight: 600,
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Body */}
      <div style={{ minHeight: '80px', display: 'flex', alignItems: 'center' }}>
        {activeTab === 'code' && (
          <div className="animate-fade-in" style={{ width: '100%', display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="glass-input"
              placeholder="Enter unique flight code (e.g. AA-102)"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearchCode()}
            />
            <button className="liquid-button liquid-button-primary" onClick={onSearchCode} style={{ padding: '0 20px' }}>
              FIND
            </button>
          </div>
        )}

        {activeTab === 'carrier' && (
          <div className="animate-fade-in" style={{ width: '100%', display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="glass-input"
              placeholder="Enter airline/carrier (e.g. Delta)"
              value={searchCarrier}
              onChange={(e) => setSearchCarrier(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearchCarrier()}
            />
            <button className="liquid-button liquid-button-primary" onClick={onSearchCarrier} style={{ padding: '0 20px' }}>
              FIND
            </button>
          </div>
        )}

        {activeTab === 'route' && (
          <div className="animate-fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="glass-input"
                placeholder="Origin Airport (e.g. LAX)"
                value={searchSource}
                onChange={(e) => setSearchSource(e.target.value)}
              />
              <input
                type="text"
                className="glass-input"
                placeholder="Destination Airport (e.g. JFK)"
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearchRoute()}
              />
            </div>
            <button className="liquid-button liquid-button-primary" onClick={onSearchRoute} style={{ width: '100%' }}>
              FIND ROUTE MANIFEST
            </button>
          </div>
        )}

        {activeTab === 'price' && (
          <div className="animate-fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="number"
                className="glass-input"
                placeholder="Min Price ($)"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <input
                type="number"
                className="glass-input"
                placeholder="Max Price ($)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearchPriceRange()}
              />
            </div>
            <button className="liquid-button liquid-button-primary" onClick={onSearchPriceRange} style={{ width: '100%' }}>
              SCAN PRICE BRACKET
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightSearchPanel;
