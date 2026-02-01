// PostCommentAnalytics.jsx
import React, { useState, useEffect } from 'react';

const PostCommentAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5000/api/admin/analytics/posts', {
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
                    <h2 className="section-title"><span className="section-icon"></span>Posts & Comments Analytics</h2>
                </div>
                <div className="stats-grid">
                    <div className="stat-card pink">
                        <div className="stat-value">{analytics?.total_posts || 0}</div>
                        <div className="stat-label">Total Posts</div>
                    </div>
                    <div className="stat-card purple">
                        <div className="stat-value">{analytics?.total_comments || 0}</div>
                        <div className="stat-label">Total Comments</div>
                    </div>
                    <div className="stat-card teal">
                        <div className="stat-value">{analytics?.total_reports || 0}</div>
                        <div className="stat-label">Total Reports</div>
                    </div>
                    <div className="stat-card purple" style={{ borderColor: '#9333ea' }}>
                        <div className="stat-value">{analytics?.comment_to_post_ratio || 0}</div>
                        <div className="stat-label">💬 Comments per Post</div>
                        <div style={{
                            fontSize: '0.75rem',
                            opacity: 0.8,
                            marginTop: '0.25rem',
                            color: (analytics?.comment_to_post_ratio || 0) >= 2 ? '#10b981' : (analytics?.comment_to_post_ratio || 0) >= 1 ? '#eab308' : '#ef4444'
                        }}>
                            {(analytics?.comment_to_post_ratio || 0) >= 2 ? '✓ High engagement' : (analytics?.comment_to_post_ratio || 0) >= 1 ? '○ Moderate' : '⚠️ Low engagement'}
                        </div>
                    </div>
                </div>
            </div>
            <div className="section-card">
                <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Posts by Status</h3>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr><th>Status</th><th>Count</th></tr>
                        </thead>
                        <tbody>
                            {analytics?.posts_by_status?.map(status => (
                                <tr key={status._id}>
                                    <td data-label="Status" style={{ textTransform: 'capitalize' }}>{status._id || 'Unknown'}</td>
                                    <td data-label="Count">{status.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PostCommentAnalytics;
