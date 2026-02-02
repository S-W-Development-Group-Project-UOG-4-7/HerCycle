// ActivityFeedWidget.jsx
import React, { useState, useEffect } from 'react';

const ActivityFeedWidget = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivity();
    }, []);

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

    return (
        <div className="section-card">
            <h3 style={{ marginBottom: '1rem', fontWeight: 600, color: 'rgb(97, 28, 175)' }}>
                📋 Recent Activity
            </h3>
            <div className="activity-feed">
                {loading && <p>Loading...</p>}
                {!loading && activities.length === 0 && (
                    <p style={{ color: '#6b7280', textAlign: 'center' }}>No recent activity</p>
                )}
                {activities.map((activity, index) => (
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
