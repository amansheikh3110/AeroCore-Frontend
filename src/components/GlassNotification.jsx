import React, { useEffect } from 'react';

const GlassNotification = ({ message, type, onClose }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  let glowColor = 'rgba(255, 255, 255, 0.15)';
  let icon = 'ℹ️';

  if (type === 'success') {
    glowColor = 'rgba(48, 209, 88, 0.15)';
    icon = '🟢';
  } else if (type === 'error') {
    glowColor = 'rgba(255, 69, 58, 0.15)';
    icon = '🔴';
  }

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 9999,
      maxWidth: '350px',
      width: 'calc(100% - 48px)',
      background: 'rgba(15, 20, 30, 0.75)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderLeft: `4px solid ${type === 'success' ? 'var(--success-glow)' : type === 'error' ? 'var(--danger-glow)' : 'var(--accent-blue)'}`,
      borderTop: '1px solid rgba(255, 255, 255, 0.25)',
      borderRadius: '14px',
      boxShadow: `0 10px 30px rgba(0, 0, 0, 0.4), 0 0 20px ${glowColor}`,
      padding: '16px',
      display: 'flex',
      alignItems: 'start',
      gap: '12px',
      animation: 'slide-in-mac 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
    }}>
      <div style={{ fontSize: '1.2rem', lineHeight: '1' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f5f5f7', fontFamily: 'Space Grotesk, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          System Telemetry
        </h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4', fontFamily: 'Inter, sans-serif' }}>
          {message}
        </p>
      </div>
      <button 
        onClick={onClose} 
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          fontSize: '1rem',
          cursor: 'pointer',
          padding: '0 4px',
          opacity: 0.7
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.7'}
      >
        ×
      </button>
    </div>
  );
};

export default GlassNotification;
