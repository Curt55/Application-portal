import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle size={20} color="#10b981" />,
    error: <XCircle size={20} color="#ef4444" />,
    warning: <AlertCircle size={20} color="#f59e0b" />,
    info: <Info size={20} color="#3b82f6" />
  };

  const bgColors = {
    success: '#d1fae5',
    error: '#fee2e2',
    warning: '#fef3c7',
    info: '#dbeafe'
  };

  const textColors = {
    success: '#065f46',
    error: '#991b1b',
    warning: '#92400e',
    info: '#1e40af'
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        background: bgColors[type],
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
        borderLeft: `4px solid ${icons[type].props.color}`,
        minWidth: '280px'
      }}>
        {icons[type]}
        <span style={{ color: textColors[type], fontSize: '14px', fontWeight: '500' }}>{message}</span>
        <button
          onClick={onClose}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: textColors[type],
            fontSize: '18px'
          }}
        >
          ×
        </button>
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;
