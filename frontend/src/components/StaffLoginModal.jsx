// src/components/StaffLoginModal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StaffLoginModal.css';

const StaffLoginModal = ({ open, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Close modal when clicking outside
    const handleBackdropClick = (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            onClose();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/staff/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            
            if (response.ok) {
                if (data.success) {
                    // Login successful
                    alert(`Login successful! Welcome ${data.user.name}`);
                    
                    // Store user info
                    localStorage.setItem('staffLoggedIn', 'true');
                    localStorage.setItem('staffEmail', data.user.email);
                    localStorage.setItem('staffName', data.user.name);
                    localStorage.setItem('staffRole', data.user.role);
                    
                    // Close modal
                    onClose();
                    
                    // Redirect to feedbacks page
                    navigate('/admin-dashboard');
                } else {
                    setError(data.message || 'Login failed');
                }
            } else {
                setError(data.message || `Login failed (Status: ${response.status})`);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Network error. Please check if backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    // If modal is not open, don't render anything
    if (!open) return null;

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="login-container">
                <div className="login-card">
                    <div className="modal-header">
                        <h2 className="login-title">Staff Login</h2>
                        <button className="close-btn" onClick={onClose}>×</button>
                    </div>
                    
                    <p className="login-subtitle">Access the admin dashboard</p>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="staff@hercycle.com"
                                required
                                className="form-input"
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                className="form-input"
                                disabled={loading}
                            />
                        </div>
                        
                        {error && (
                            <div className="error-message">
                                <strong>Error:</strong> {error}
                            </div>
                        )}
                        
                        <div className="modal-buttons">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`login-button ${loading ? 'loading' : ''}`}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Logging in...
                                    </>
                                ) : (
                                    'Login'
                                )}
                            </button>
                        </div>
                        
                    
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StaffLoginModal;