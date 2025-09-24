import React from 'react';

export default function LoadingSpinner({ size = 'medium', message = 'Loading...' }) {
  const sizeStyles = {
    small: { width: '20px', height: '20px' },
    medium: { width: '40px', height: '40px' },
    large: { width: '60px', height: '60px' }
  };

  return (
    <div style={containerStyle}>
      <div 
        style={{
          ...spinnerStyle,
          ...sizeStyles[size]
        }}
      />
      {message && <p style={messageStyle}>{message}</p>}
    </div>
  );
}

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px'
};

const spinnerStyle = {
  border: '3px solid #f3f3f3',
  borderTop: '3px solid #1976d2',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

const messageStyle = {
  marginTop: '12px',
  color: '#666',
  fontSize: '14px',
  fontWeight: '500'
};

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);