import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={errorContainerStyle}>
          <div style={errorCardStyle}>
            <div style={errorIconStyle}>⚠️</div>
            <h2 style={errorTitleStyle}>Something went wrong</h2>
            <p style={errorMessageStyle}>
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={errorDetailsStyle}>
                <summary style={errorSummaryStyle}>Error Details (Development)</summary>
                <pre style={errorPreStyle}>
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <div style={errorActionsStyle}>
              <button 
                style={errorButtonStyle}
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
              <button 
                style={errorButtonSecondaryStyle}
                onClick={() => window.location.href = '/'}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Styles
const errorContainerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(120deg, #f8f9fa 0%, #e9ecef 100%)',
  padding: '20px'
};

const errorCardStyle = {
  background: 'white',
  borderRadius: '16px',
  padding: '40px',
  maxWidth: '600px',
  width: '100%',
  textAlign: 'center',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e9ecef'
};

const errorIconStyle = {
  fontSize: '64px',
  marginBottom: '20px'
};

const errorTitleStyle = {
  color: '#dc3545',
  marginBottom: '16px',
  fontSize: '24px',
  fontWeight: '600'
};

const errorMessageStyle = {
  color: '#6c757d',
  marginBottom: '24px',
  fontSize: '16px',
  lineHeight: '1.5'
};

const errorDetailsStyle = {
  marginBottom: '24px',
  textAlign: 'left',
  background: '#f8f9fa',
  borderRadius: '8px',
  padding: '16px'
};

const errorSummaryStyle = {
  cursor: 'pointer',
  fontWeight: '500',
  color: '#495057',
  marginBottom: '12px'
};

const errorPreStyle = {
  fontSize: '12px',
  color: '#dc3545',
  overflow: 'auto',
  maxHeight: '200px',
  margin: 0
};

const errorActionsStyle = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'center'
};

const errorButtonStyle = {
  background: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background 0.2s'
};

const errorButtonSecondaryStyle = {
  background: 'transparent',
  color: '#6c757d',
  border: '1px solid #dee2e6',
  borderRadius: '8px',
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

export default ErrorBoundary;