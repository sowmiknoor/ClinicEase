import { useEffect } from 'react';
import './Toast.css';

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: '✓',
    error: '⚠',
    warning: '⚠',
    info: 'ℹ'
  };

  return (
    <div className={`toast toast-${type}`} role="alert" aria-live="assertive">
      <div className="toast-icon">{icons[type]}</div>
      <div className="toast-message">{message}</div>
      <button 
        className="toast-close"
        onClick={onClose}
        aria-label="Close notification"
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          padding: '0'
        }}
      >
        ×
      </button>
    </div>
  );
}
