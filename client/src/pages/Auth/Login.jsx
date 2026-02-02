import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRolePopup, setShowRolePopup] = useState(false);
  const [pendingUserData, setPendingUserData] = useState(null);
  const [pendingToken, setPendingToken] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting login with:', formData.email);
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await response.json();
      console.log('📦 Login response:', data);

      if (data.success) {
        // ✅ FIX: Backend returns data.data, not data.user
        const userData = data.data;
        
        console.log('✅ Login successful! User data:', userData);
        console.log('🎯 User role:', userData.role);
        console.log('🎯 User type:', userData.user_type);

        // Redirect based on user role
        const userRole = userData.role || userData.user_type;

        if (userRole === 'doctor') {
          console.log('🔄 Doctor detected — showing role selection popup');
          setPendingUserData(userData);
          setPendingToken(data.token);
          setShowRolePopup(true);
          setLoading(false);
          return;
        }

        // Store auth data for non-doctor roles
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(userData));

        if (userRole === 'admin') {
          console.log('🔄 Redirecting to admin dashboard');
          navigate('/admin-dashboard');
        } else if (userRole === 'web_manager') {
          console.log('🔄 Redirecting to web manager dashboard');
          navigate('/web-manager-dashboard');
        } else {
          console.log('🔄 Redirecting to user dashboard');
          navigate('/dashboard');
        }
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
        console.error('❌ Login failed:', data.message);
        
        // Suggest test credentials if login fails
        if (data.message?.includes('Invalid credentials') || data.message?.includes('not found')) {
          setError(prev => prev + ' Try test@test.com / test123');
        }
      }
    } catch (err) {
      setError('Network error. Please make sure the backend server is running.');
      console.error('❌ Network error:', err);
      
      // Fallback to test endpoint
      try {
        console.log('🔄 Trying test login endpoint...');
        const testResponse = await fetch('http://localhost:5000/api/auth/login-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        const testData = await testResponse.json();
        if (testData.success) {
          localStorage.setItem('authToken', testData.token);
          localStorage.setItem('user', JSON.stringify(testData.data));
          navigate('/dashboard');
          return;
        }
      } catch (testErr) {
        console.error('❌ Test login also failed:', testErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (dashboard) => {
    localStorage.setItem('authToken', pendingToken);
    localStorage.setItem('user', JSON.stringify(pendingUserData));
    setShowRolePopup(false);
    if (dashboard === 'doctor') {
      navigate('/doctor-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  // Test login function for quick testing
  const handleTestLogin = (type) => {
    if (type === 'admin') {
      setFormData({
        email: 'admin@hercycle.com',
        password: 'admin123'
      });
    } else {
      setFormData({
        email: 'test@test.com',
        password: 'test123'
      });
    }
  };

  return (
    <div className="auth-container">
      
      {/* Back to Home Button */}
      <button
        onClick={() => navigate('/')}
        className="back-home-btn"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          padding: '10px 20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(219, 39, 119, 0.3)',
          zIndex: 10
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(219, 39, 119, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(219, 39, 119, 0.3)';
        }}
      >
        <span>←</span>
        Back to Home
      </button>

      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your HerCycle account</p>
        </div>

        {error && (
          <div className="auth-error">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              disabled={loading}
              style={{ width: '100%' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                disabled={loading}
                style={{ width: '100%' }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
            style={{ width: '100%', marginTop: '20px' }}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="auth-links">
            <Link to="/forgot-password">Forgot Password?</Link>
            <span>
              Don't have an account? <Link to="/register">Sign Up</Link>
            </span>
          </div>
        </form>
      </div>

      {/* Doctor Role Selection Popup */}
      {showRolePopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px 35px',
            maxWidth: '420px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            animation: 'fadeInUp 0.3s ease'
          }}>
            <h2 style={{ margin: '0 0 8px 0', color: '#1a1a1b', fontSize: '22px', textAlign: 'center' }}>
              How would you like to join?
            </h2>
            <p style={{ color: '#666', textAlign: 'center', marginBottom: '30px', fontSize: '14px' }}>
              Your account has doctor privileges. Choose how you'd like to continue.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <button
                onClick={() => handleRoleSelect('doctor')}
                style={{
                  padding: '18px 20px',
                  background: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 15px rgba(219,39,119,0.3)',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span style={{ fontSize: '28px' }}>🩺</span>
                <div>
                  <div>Doctor Dashboard</div>
                  <div style={{ fontSize: '12px', opacity: 0.85, fontWeight: 400 }}>
                    Manage articles, consultations & patients
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('community')}
                style={{
                  padding: '18px 20px',
                  background: 'white',
                  color: '#333',
                  border: '2px solid #e0e0e0',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  transition: 'transform 0.2s, border-color 0.2s',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#db2777'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e0e0e0'; }}
              >
                <span style={{ fontSize: '28px' }}>👥</span>
                <div>
                  <div>Community Dashboard</div>
                  <div style={{ fontSize: '12px', color: '#888', fontWeight: 400 }}>
                    Browse articles, comment & interact
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;