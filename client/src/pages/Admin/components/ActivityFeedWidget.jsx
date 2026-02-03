// ActivityFeedWidget.jsx
import React, { useState, useEffect } from 'react';

const ActivityFeedWidget = () => {
    const [activities, setActivities] = useState([]);
    const [suspendedUserNICs, setSuspendedUserNICs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSuspendedUsers();
        fetchActivity();

        // Auto-refresh every 30 seconds for recent activity
        const refreshInterval = setInterval(() => {
            fetchActivity();
        }, 30000);

        return () => clearInterval(refreshInterval);
    }, []);

    const fetchSuspendedUsers = async () => {
        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/admin/suspended-users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSuspendedUserNICs(data.data.map(user => user.NIC));
            }
        } catch (error) {
            console.error('Error fetching suspended users:', error);
        }
    };

    const fetchActivity = async () => {
        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/admin/recent-activity?limit=5', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setActivities(data.data);
        } catch (error) {
            console.error('Error fetching activity:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'warning': return '⚠️';
            case 'doctor_approval': return '✅';
            case 'suspension': return '🔒';
            case 'user_registration': return '👤';
            case 'post_created': return '📝';
            default: return '📌';
        }
    };

    const getTimeAgo = (timestamp) => {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    // Filter activities to exclude suspended users
    const activeActivities = activities.filter(activity => {
        // Filter based on user_nic or target_nic in the activity
        const userNic = activity.user_nic || activity.target_nic;
        return !suspendedUserNICs.includes(userNic);
    });

    return (
        <div className="section-card">
            <h3 style={{ marginBottom: '1rem', fontWeight: 600, color: 'rgb(97, 28, 175)' }}>
                📋 Recent Activity
            </h3>
            <div className="activity-feed">
                {loading && <p>Loading...</p>}
                {!loading && activeActivities.length === 0 && (
                    <p style={{ color: '#6b7280', textAlign: 'center' }}>No recent activity</p>
                )}
                {activeActivities.map((activity, index) => (
                    <div key={index} className="activity-item">
                        <span className="activity-icon">{getActivityIcon(activity.type)}</span>
                        <div className="activity-content">
                            <p>{activity.message}</p>
                            <span className="activity-time">{getTimeAgo(activity.timestamp)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityFeedWidget;
