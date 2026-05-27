import React from 'react';

const BoardingPassTicket = ({ flight }) => {
  const code = flight.code || 'FLIGHT';
  const carrier = flight.carrier || 'AIRLINE CARRIER';
  const source = flight.source || 'SRC';
  const destination = flight.destination || 'DST';
  const cost = flight.cost ? `$${parseFloat(flight.cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00';

  // Semi-random mock details based on flight code length / characters
  const gate = code.length > 2 ? code.substring(0, 2).toUpperCase() : 'G1';
  const seat = code.length > 3 ? `${code.substring(2, 4).toUpperCase()}9` : '18A';
  const flightClass = parseFloat(flight.cost) > 1000 ? 'FIRST CLASS' : 'ECONOMY';
  
  return (
    <div className="boarding-pass-card" style={{ width: '100%', maxWidth: '380px', margin: '20px auto 0 auto' }}>
      {/* Glossy overlay header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px dashed rgba(255, 255, 255, 0.15)',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>✈</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-glow)', letterSpacing: '2px' }}>
            BOARDING PASS
          </span>
        </div>
        <span style={{
          fontSize: '0.75rem',
          padding: '4px 8px',
          borderRadius: '20px',
          background: 'rgba(0, 255, 213, 0.12)',
          border: '1px solid rgba(0, 255, 213, 0.25)',
          color: 'var(--primary-glow)',
          fontWeight: 600
        }}>
          {flightClass}
        </span>
      </div>

      {/* Ticket Details Panel */}
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h4 style={{ fontSize: '2rem', margin: 0, fontWeight: 700, letterSpacing: '1px', color: '#fff' }}>
              {source.toUpperCase().substring(0, 3)}
            </h4>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>DEPARTURE</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{code}</span>
            <div style={{ width: '80%', height: '2px', background: 'linear-gradient(to right, rgba(255,255,255,0.05), var(--primary-glow), rgba(255,255,255,0.05))', position: 'relative' }}>
              <span style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(90deg) translateX(-1px)',
                fontSize: '0.8rem',
                color: 'var(--primary-glow)'
              }}>✈</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <h4 style={{ fontSize: '2rem', margin: 0, fontWeight: 700, letterSpacing: '1px', color: '#fff' }}>
              {destination.toUpperCase().substring(0, 3)}
            </h4>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>ARRIVAL</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>CARRIER</span>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f5f5f7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {carrier}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>PRICE</span>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-glow)' }}>
              {cost}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>GATE</span>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f5f5f7' }}>{gate}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>SEAT</span>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f5f5f7' }}>{seat}</p>
          </div>
        </div>
      </div>

      {/* Ticket Footer / Barcode */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px dashed rgba(255, 255, 255, 0.15)',
        background: 'rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* Render a custom high-tech barcode */}
        <div style={{ display: 'flex', width: '100%', height: '35px', gap: '2px', overflow: 'hidden', opacity: 0.75 }}>
          {Array.from({ length: 48 }).map((_, idx) => {
            const isFilled = (idx * 7 + 13) % 5 !== 0; // deterministic pattern
            const barWidth = (idx % 3 === 0) ? '3px' : (idx % 2 === 0) ? '1px' : '2px';
            return (
              <div
                key={idx}
                style={{
                  width: barWidth,
                  height: '100%',
                  backgroundColor: isFilled ? 'var(--text-primary)' : 'transparent',
                  flexShrink: 0
                }}
              />
            );
          })}
        </div>
        <span style={{ fontSize: '0.65rem', letterSpacing: '5px', color: 'var(--text-secondary)' }}>
          AEROCORE-{code.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default BoardingPassTicket;
