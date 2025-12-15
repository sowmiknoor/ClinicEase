import { useEffect } from 'react';
import '../index.css';

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      default: return 'ℹ';
    }
  };

  return (
    <div className={`toast ${type} animate-slide-in-left`}>
      <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{getIcon()}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button 
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
          color: 'inherit',
          opacity: 0.6,
          padding: '0 4px'
        }}
      >
        ×
      </button>
    </div>
  );
}
