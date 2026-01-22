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
        
        // Store auth data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('✅ Login successful! User data:', userData);
        console.log('🎯 User role:', userData.role);
        console.log('🎯 User type:', userData.user_type);
        
        // Redirect based on user role
        const userRole = userData.role || userData.user_type;
        
        if (userRole === 'admin') {
          console.log('🔄 Redirecting to admin dashboard');
          navigate('/admin-dashboard');
        } else if (userRole === 'doctor') {
          console.log('🔄 Redirecting to doctor dashboard');
          navigate('/doctor-dashboard');
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

  // Test login function for quick testing
  const handleTestLogin = (type) => {
    if (type === 'admin') {
      setFormData({
        email: 'admin@hercycle.com',
        password: 'admin123'
      });
    } else {
      setFormData({
        email: 'web@hercycle.com',
        password: 'admin123'
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
    </div>
  );
};

export default Login;