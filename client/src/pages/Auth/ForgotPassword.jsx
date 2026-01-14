// ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Verify Code, 3: New Password
  const [formData, setFormData] = useState({
    email: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Step 1: Request reset code
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message || 'Reset code sent to your email');
        setStep(2); // Move to verification step
        startResendCooldown();
      } else {
        setError(data.message || 'Failed to send reset code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Request reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify reset code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          resetCode: formData.resetCode
        }),
      });

      const data = await response.json();

      if (data.success) {
        setVerificationToken(data.verificationToken);
        setStep(3); // Move to password reset step
      } else {
        setError(data.message || 'Invalid verification code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Verify code error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationToken,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message || 'Password reset successful!');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Resend reset code
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message || 'New code sent to your email');
        startResendCooldown();
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Resend code error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Start cooldown timer for resend
  const startResendCooldown = () => {
    setResendCooldown(60); // 60 seconds
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Back to previous step
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
      setSuccess('');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="auth-container">
      
      {/* Back Button */}
      <button
        onClick={handleBack}
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
        {step === 1 ? 'Back to Login' : 'Back'}
      </button>

      <div className="auth-card">
        
        {/* Progress Steps */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '30px',
          position: 'relative'
        }}>
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: step >= stepNumber 
                  ? 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)' 
                  : '#e5e7eb',
                color: step >= stepNumber ? 'white' : '#9ca3af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}>
                {stepNumber}
              </div>
              <div style={{
                marginTop: '8px',
                fontSize: '12px',
                color: step >= stepNumber ? '#db2777' : '#9ca3af',
                fontWeight: step >= stepNumber ? '600' : '400',
                textAlign: 'center'
              }}>
                {stepNumber === 1 ? 'Enter Email' : stepNumber === 2 ? 'Verify Code' : 'New Password'}
              </div>
            </div>
          ))}
          
          {/* Connecting Line */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            height: '2px',
            background: '#e5e7eb',
            zIndex: 1
          }}></div>
        </div>

        <div className="auth-header">
          <h2>
            {step === 1 && 'Reset Your Password'}
            {step === 2 && 'Enter Verification Code'}
            {step === 3 && 'Create New Password'}
          </h2>
          <p>
            {step === 1 && 'Enter your email to receive a reset code'}
            {step === 2 && 'Check your email for the 6-digit code'}
            {step === 3 && 'Enter your new password'}
          </p>
        </div>

        {error && (
          <div className="auth-error">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '15px',
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
            border: '1px solid #10b981',
            borderRadius: '8px',
            marginBottom: '20px',
            color: '#065f46',
            fontSize: '14px'
          }}>
            <span style={{ marginRight: '8px' }}>✅</span>
            {success}
          </div>
        )}

        <form onSubmit={
          step === 1 ? handleRequestReset :
          step === 2 ? handleVerifyCode :
          handleResetPassword
        } className="auth-form">

          {/* Step 1: Email Input */}
          {step === 1 && (
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your registered email"
                disabled={loading}
                style={{ width: '100%' }}
              />
              <div style={{
                marginTop: '10px',
                fontSize: '13px',
                color: '#6b7280'
              }}>
                <p>🔒 We'll send a 6-digit verification code to this email.</p>
              </div>
            </div>
          )}

          {/* Step 2: Verification Code */}
          {step === 2 && (
            <>
              <div className="form-group">
                <label htmlFor="resetCode">6-Digit Verification Code</label>
                <input
                  type="text"
                  id="resetCode"
                  name="resetCode"
                  value={formData.resetCode}
                  onChange={handleChange}
                  required
                  placeholder="Enter 6-digit code"
                  disabled={loading}
                  maxLength="6"
                  pattern="[0-9]{6}"
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    letterSpacing: '10px',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}
                />
                <div style={{
                  marginTop: '10px',
                  fontSize: '13px',
                  color: '#6b7280'
                }}>
                  <p>📧 Code sent to: <strong>{formData.email}</strong></p>
                  <p>⏰ Code expires in 15 minutes</p>
                </div>
              </div>

              {/* Resend Code */}
              <div style={{
                marginTop: '20px',
                textAlign: 'center'
              }}>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading || resendCooldown > 0}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resendCooldown > 0 ? '#9ca3af' : '#db2777',
                    cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    textDecoration: 'underline',
                    padding: '0'
                  }}
                >
                  {resendCooldown > 0 
                    ? `Resend available in ${formatTime(resendCooldown)}`
                    : 'Didn\'t receive code? Resend'
                  }
                </button>
              </div>
            </>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    placeholder="Enter new password"
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

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm new password"
                  disabled={loading}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{
                marginTop: '10px',
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#6b7280'
              }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>Password Requirements:</p>
                <ul style={{ margin: '0', paddingLeft: '20px' }}>
                  <li>At least 8 characters long</li>
                  <li>Not the same as old password</li>
                  <li>Use a mix of letters, numbers, and symbols</li>
                </ul>
              </div>
            </>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
            style={{ width: '100%', marginTop: '20px' }}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                {step === 1 ? 'Sending Code...' : 
                 step === 2 ? 'Verifying...' : 
                 'Resetting Password...'}
              </>
            ) : (
              step === 1 ? 'Send Reset Code' :
              step === 2 ? 'Verify Code' :
              'Reset Password'
            )}
          </button>

          <div className="auth-links" style={{ marginTop: '20px' }}>
            <span>
              Remember your password? <Link to="/login">Back to Login</Link>
            </span>
          </div>
        </form>

        {/* Security Info */}
        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#991b1b'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>🔒 Security Notice:</p>
          <p style={{ margin: '0' }}>
            Never share your verification code or password with anyone. 
            HerCycle support will never ask for your password.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;