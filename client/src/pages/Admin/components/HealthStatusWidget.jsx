// HealthStatusWidget.jsx
import React, { useState, useEffect } from 'react';

const HealthStatusWidget = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchHealth = async () => {
        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/admin/health', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setStatus(data);
        } catch (error) {
            console.error('Error fetching health:', error);
            setStatus({ connected: false });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="stat-card">...</div>;

    return (
        <div className={`stat-card ${status?.connected ? 'green' : 'red'}`}>
            <div className="stat-icon">{status?.connected ? '🟢' : '🔴'}</div>
            <div className="stat-content">
                <div className="stat-value">{status?.connected ? 'Connected' : 'Disconnected'}</div>
                <div className="stat-label">Database Status</div>
                {status?.connected && (
                    <div style={{ fontSize: '0.8rem', marginTop: '0.25rem', color: 'rgba(255,255,255,0.8)' }}>
                        {status.latency}ms
                    </div>
                )}
            </div>
        </div>
    );
};

export default HealthStatusWidget;
