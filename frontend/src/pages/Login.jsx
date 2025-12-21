import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Login.css';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Generate floating hearts
  const generateHearts = () => {
    const hearts = [];
    for (let i = 0; i < 6; i++) {
      hearts.push({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 15}s`,
        size: `${Math.random() * 12 + 8}px`,
        opacity: Math.random() * 0.15 + 0.1
      });
    }
    return hearts;
  };

  const hearts = generateHearts();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Simulate API call
    try {
      // In a real app, you would make an API call here
      // const response = await fetch('/api/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // For demo purposes, simulate successful login
      setTimeout(() => {
        if (rememberMe) {
          // Save to localStorage if remember me is checked
          localStorage.setItem('rememberedUser', formData.username);
        }
        
        // Store user data in sessionStorage (in real app, you'd get this from API)
        sessionStorage.setItem('user', JSON.stringify({
          username: formData.username,
          name: formData.username === 'demo' ? 'Demo User' : 'User',
          email: `${formData.username}@example.com`,
          isLoggedIn: true
        }));
        
        // Redirect to profile/dashboard
        navigate('/profile');
      }, 1500);
      
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      username: 'demo',
      password: 'demopassword'
    });
  };

  return (
    <div className="login-container">
      {/* Floating Hearts Background */}
      <div className="floating-hearts">
        {hearts.map(heart => (
          <div
            key={heart.id}
            className="heart"
            style={{
              left: heart.left,
              animationDelay: heart.delay,
              fontSize: heart.size,
              opacity: heart.opacity
            }}
          >
            ❤️
          </div>
        ))}
      </div>

      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back! 👋</h1>
          <p>Sign in to continue your health journey with HerCycle</p>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">
              👤 Username or Email
            </label>
            <div className="input-with-icon">
              
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your username or email"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">
              🔒 Password
            </label>
            <div className="input-with-icon">
              
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="remember-forgot">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-custom"></span>
              <span>Remember me</span>
            </label>
            <a href="/forgot-password" className="forgot-password">
              Forgot password?
            </a>
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner">⏳</span>
                Signing In...
              </>
            ) : (
              <>
                🔑 Sign In
              </>
            )}
          </button>

          <div className="divider">
            <span>Or continue with</span>
          </div>

          <div className="social-login">
            <button 
              type="button" 
              className="social-btn google"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              <span>🔴</span>
              Google
            </button>
            <button 
              type="button" 
              className="social-btn apple"
              disabled={loading}
            >
              <span>⚫</span>
              Apple
            </button>
          </div>

          <div className="login-footer">
            <p>
              Don't have an account?{" "}
              <a href="/register">Create account</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}