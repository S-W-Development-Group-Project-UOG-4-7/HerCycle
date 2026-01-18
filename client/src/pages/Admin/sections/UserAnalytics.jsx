// UserAnalytics.jsx
import React, { useState, useEffect } from 'react';

const UserAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5000/api/admin/analytics/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setAnalytics(data.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading analytics...</div>;

    return (
        <div>
            <div className="section-card">
                <div className="section-header">
                    <h2 className="section-title"><span className="section-icon"></span>User Analytics</h2>
                </div>
                <div className="stats-grid">
                    <div className="stat-card pink">
                        <div className="stat-value">{analytics?.total_users || 0}</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                    <div className="stat-card purple">
                        <div className="stat-value">{analytics?.active_users || 0}</div>
                        <div className="stat-label">Active Users</div>
                    </div>
                    <div className="stat-card teal">
                        <div className="stat-value">{analytics?.cycle_users || 0}</div>
                        <div className="stat-label">Cycle Tracking Users</div>
                    </div>
                </div>
            </div>
            <div className="section-card">
                <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Users by Role</h3>
                <table className="data-table">
                    <thead>
                        <tr><th>Role</th><th>Count</th></tr>
                    </thead>
                    <tbody>
                        {analytics?.users_by_role?.map(role => (
                            <tr key={role._id}>
                                <td style={{ textTransform: 'capitalize' }}>{role._id || 'Unknown'}</td>
                                <td>{role.count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserAnalytics;
