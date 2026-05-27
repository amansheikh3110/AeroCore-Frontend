import React, { useState, useEffect } from 'react';

const FlightRadar = ({ flights, onSelectFlight, selectedFlightCode }) => {
  const [radarDots, setRadarDots] = useState([]);
  const [hoveredFlight, setHoveredFlight] = useState(null);

  // Deterministically position flight blips based on airport codes or flight code
  useEffect(() => {
    const dots = flights.map((flight) => {
      // Create a hash code from flight code
      let hash = 0;
      const str = flight.code + flight.source + flight.destination;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      // Map hash to polar coordinates within radar radius (radar SVG is 300x300, center is 150,150)
      const radiusLimit = 125; // keep dots within the rings
      const distance = Math.abs(hash % radiusLimit) + 20; // radius from center
      const angle = (Math.abs(hash) % 360) * (Math.PI / 180); // angle in radians
      
      const x = 150 + distance * Math.cos(angle);
      const y = 150 + distance * Math.sin(angle);

      return {
        ...flight,
        x,
        y
      };
    });
    setRadarDots(dots);
  }, [flights]);

  return (
    <div className="liquid-glass" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ alignSelf: 'flex-start', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 className="hud-title" style={{ fontSize: '1.1rem' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-glow)', boxShadow: '0 0 10px var(--primary-glow)' }}></span>
          TACTICAL AIRSPACE SCANNER
        </h3>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'Space Grotesk, monospace' }}>
          RANGE: 500 NM
        </span>
      </div>

      <div style={{ position: 'relative', width: '280px', height: '280px', background: 'rgba(0,0,0,0.25)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Radar concentric rings */}
        <div style={{ position: 'absolute', inset: '10%', borderRadius: '50%', border: '1px dashed rgba(0, 255, 213, 0.15)' }} />
        <div style={{ position: 'absolute', inset: '30%', borderRadius: '50%', border: '1px solid rgba(0, 255, 213, 0.08)' }} />
        <div style={{ position: 'absolute', inset: '50%', borderRadius: '50%', border: '1px dashed rgba(0, 255, 213, 0.15)' }} />
        <div style={{ position: 'absolute', inset: '70%', borderRadius: '50%', border: '1px solid rgba(0, 255, 213, 0.08)' }} />
        
        {/* Radar crosshairs */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(0, 255, 213, 0.12)' }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(0, 255, 213, 0.12)' }} />

        {/* Rotating sweep line */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, rgba(0, 255, 213, 0.18) 0deg, rgba(0, 255, 213, 0) 60deg, transparent 180deg)',
          animation: 'radar-sweep 6s linear infinite',
          pointerEvents: 'none'
        }} />

        {/* Active flights blips */}
        <svg viewBox="0 0 300 300" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', zIndex: 2 }}>
          {radarDots.map((dot) => {
            const isSelected = selectedFlightCode === dot.code;
            return (
              <g 
                key={dot.code} 
                onClick={() => onSelectFlight(dot)}
                onMouseEnter={() => setHoveredFlight(dot)}
                onMouseLeave={() => setHoveredFlight(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Outer pulsing ping */}
                <circle 
                  cx={dot.x} 
                  cy={dot.y} 
                  r={isSelected ? 10 : 6} 
                  fill="none" 
                  stroke={isSelected ? 'var(--secondary-glow)' : 'var(--primary-glow)'} 
                  strokeWidth="1.5"
                  style={{
                    animation: 'pulse-glow 2s infinite',
                    transformOrigin: `${dot.x}px ${dot.y}px`
                  }}
                />
                {/* Core blip dot */}
                <circle 
                  cx={dot.x} 
                  cy={dot.y} 
                  r={isSelected ? 5 : 3.5} 
                  fill={isSelected ? 'var(--secondary-glow)' : 'var(--primary-glow)'}
                />
                
                {/* Tiny flight code label */}
                <text
                  x={dot.x + 8}
                  y={dot.y + 4}
                  fill={isSelected ? 'var(--secondary-glow)' : 'var(--text-primary)'}
                  fontSize="8px"
                  fontFamily="Space Grotesk, monospace"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  style={{ pointerEvents: 'none', opacity: isSelected ? 1 : 0.7 }}
                >
                  {dot.code}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Telemetry HUD display on hover */}
        {hoveredFlight && (
          <div className="animate-fade-in" style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(7, 9, 14, 0.95)',
            border: '1px solid var(--border-specular)',
            borderRadius: '10px',
            padding: '8px 14px',
            width: '180px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 10,
            pointerEvents: 'none',
            fontSize: '0.75rem',
            fontFamily: 'Space Grotesk, monospace'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', marginBottom: '4px' }}>
              <span style={{ color: 'var(--primary-glow)', fontWeight: 'bold' }}>{hoveredFlight.code}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{hoveredFlight.carrier.substring(0, 10)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>ROUTE:</span>
              <span style={{ color: '#fff' }}>{hoveredFlight.source} ✈ {hoveredFlight.destination}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>COST:</span>
              <span style={{ color: 'var(--primary-glow)' }}>${parseFloat(hoveredFlight.cost).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      <p style={{ marginTop: '14px', fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '240px' }}>
        Hover over blips for instant telemetry. Click a blip to highlight and review manifest records.
      </p>
    </div>
  );
};

export default FlightRadar;
