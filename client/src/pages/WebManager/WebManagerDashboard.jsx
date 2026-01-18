// WebManagerDashboard.jsx - Web Manager Dashboard with deactivation check
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../Dashboard/Dashboard';

const WebManagerDashboard = () => {
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkWebManagerStatus = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken');
            const user = JSON.parse(localStorage.getItem('user'));

            if (!token || !user) {
                navigate('/login');
                return;
            }

            // Check if user is a web manager
            if (user.role !== 'web_manager') {
                navigate('/dashboard');
                return;
            }

            // Check web manager active status from backend
            const response = await fetch(`http://localhost:5000/api/admin/check-web-manager-status/${user.NIC}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setIsActive(data.is_active);
            } else {
                // If can't verify, assume active
                setIsActive(true);
            }
        } catch (error) {
            console.error('Error checking web manager status:', error);
            setIsActive(true); // Default to active if error
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        checkWebManagerStatus();
    }, [checkWebManagerStatus]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #fdf2f8 0%, #faf5ff 50%, #f0fdfa 100%)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: '4px solid #f3f4f6',
                        borderTopColor: '#db2777',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <p style={{ color: '#6b7280' }}>Checking access...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
            </div>
        );
    }

    // If web manager is deactivated, show blocked message
    if (isActive === false) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #fdf2f8 0%, #faf5ff 50%, #f0fdfa 100%)',
                padding: '2rem'
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '3rem',
                    maxWidth: '500px',
                    textAlign: 'center',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                    border: '1px solid #fee2e2'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        fontSize: '2.5rem'
                    }}>
                        🚫
                    </div>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        color: '#991b1b',
                        marginBottom: '1rem'
                    }}>
                        Account Deactivated
                    </h1>
                    <p style={{
                        fontSize: '1rem',
                        color: '#6b7280',
                        marginBottom: '1.5rem',
                        lineHeight: 1.6
                    }}>
                        Your web manager account has been <strong style={{ color: '#ef4444' }}>deactivated by the administrator</strong>.
                        You no longer have access to the web manager dashboard.
                    </p>
                    <p style={{
                        fontSize: '0.9rem',
                        color: '#9ca3af',
                        marginBottom: '2rem',
                        padding: '1rem',
                        background: '#fef2f2',
                        borderRadius: '8px',
                        border: '1px solid #fecaca'
                    }}>
                        If you believe this is a mistake, please contact the system administrator for assistance.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: '0.75rem 2rem',
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            Logout
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                padding: '0.75rem 2rem',
                                background: '#f3f4f6',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // If active, render the normal dashboard
    return <Dashboard />;
};

export default WebManagerDashboard;
