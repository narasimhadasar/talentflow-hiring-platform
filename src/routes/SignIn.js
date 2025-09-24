import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignIn({ onSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simple validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Simulate authentication
    setTimeout(() => {
      if (email === 'hr@talentflow.com' && password === 'password') {
        localStorage.setItem('isAuthenticated', 'true');
        onSignIn && onSignIn();
        navigate('/');
      } else {
        setError('Invalid email or password');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={headerStyle}>
            <h1 style={titleStyle}>🎯 TalentFlow</h1>
            <p style={subtitleStyle}>HR Portal Sign In</p>
          </div>

          <form onSubmit={handleSubmit} style={formStyle}>
            {error && (
              <div style={errorStyle}>
                {error}
              </div>
            )}

            <div style={fieldStyle}>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hr@talentflow.com"
                style={inputStyle}
                disabled={loading}
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={inputStyle}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              style={{
                ...buttonStyle,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={footerStyle}>
            <p style={demoStyle}>
              Demo Credentials:<br />
              Email: hr@talentflow.com<br />
              Password: password
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
};

const containerStyle = {
  width: '100%',
  maxWidth: '400px',
};

const cardStyle = {
  background: 'white',
  borderRadius: '20px',
  padding: '40px',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '32px',
};

const titleStyle = {
  fontSize: '2rem',
  fontWeight: '700',
  color: '#1976d2',
  margin: '0 0 8px 0',
  letterSpacing: '0.5px',
};

const subtitleStyle = {
  fontSize: '1rem',
  color: '#666',
  margin: 0,
  fontWeight: '500',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const labelStyle = {
  fontSize: '0.9rem',
  fontWeight: '600',
  color: '#333',
};

const inputStyle = {
  padding: '12px 16px',
  borderRadius: '8px',
  border: '2px solid #e9ecef',
  fontSize: '1rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  backgroundColor: '#f8f9fa',
};

const buttonStyle = {
  background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  padding: '14px 24px',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'transform 0.2s',
  marginTop: '8px',
};

const errorStyle = {
  background: '#ffebee',
  color: '#c62828',
  padding: '12px 16px',
  borderRadius: '8px',
  fontSize: '0.9rem',
  border: '1px solid #ffcdd2',
};

const footerStyle = {
  marginTop: '24px',
  textAlign: 'center',
};

const demoStyle = {
  fontSize: '0.85rem',
  color: '#666',
  background: '#f8f9fa',
  padding: '12px',
  borderRadius: '8px',
  margin: 0,
  lineHeight: 1.5,
};