// PostCommentAnalytics.jsx - Enhanced with Charts
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

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

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner" style={{ fontSize: '2rem' }}>📊</div>
            <p>Loading analytics...</p>
        </div>
    );

    // Prepare data for charts
    const statusData = analytics?.posts_by_status?.map(status => ({
        name: (status._id || 'Unknown').charAt(0).toUpperCase() + (status._id || 'Unknown').slice(1),
        value: status.count,
        count: status.count
    })) || [];

    const engagementData = [
        { name: 'Posts', value: analytics?.total_posts || 0, color: '#ec4899' },
        { name: 'Comments', value: analytics?.total_comments || 0, color: '#a855f7' },
        { name: 'Reports', value: analytics?.total_reports || 0, color: '#14b8a6' }
    ];

    const COLORS = {
        'Published': '#10b981',
        'Draft': '#f59e0b',
        'Removed': '#ef4444',
        'Active': '#3b82f6',
        'Unknown': '#9ca3af'
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: '1px solid #e5e7eb'
                }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>{payload[0].name}</p>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280' }}>
                        Count: <strong>{payload[0].value}</strong>
                    </p>
                </div>
            );
        }
        return null;
    };

    const totalPosts = analytics?.total_posts || 0;
    const totalComments = analytics?.total_comments || 0;
    const totalReports = analytics?.total_reports || 0;
    const ratio = analytics?.comment_to_post_ratio || 0;

    return (
        <div>
            {/* Summary Cards */}
            <div className="section-card">
                <div className="section-header">
                    <h2 className="section-title"><span className="section-icon">📊</span>Posts & Comments Analytics</h2>
                </div>
                <div className="stats-grid">
                    <div className="stat-card pink">
                        <div className="stat-value">{totalPosts}</div>
                        <div className="stat-label">Total Posts</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
                            📝 Published content
                        </div>
                    </div>
                    <div className="stat-card purple">
                        <div className="stat-value">{totalComments}</div>
                        <div className="stat-label">Total Comments</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
                            💬 User interactions
                        </div>
                    </div>
                    <div className="stat-card teal">
                        <div className="stat-value">{totalReports}</div>
                        <div className="stat-label">Total Reports</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
                            ⚠️ Flagged content
                        </div>
                    </div>
                    <div className="stat-card purple" style={{ borderColor: '#9333ea' }}>
                        <div className="stat-value">{ratio.toFixed(2)}</div>
                        <div className="stat-label">💬 Comments per Post</div>
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            marginTop: '0.5rem',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            background: ratio >= 2 ? '#d1fae5' : ratio >= 1 ? '#fef3c7' : '#fee2e2',
                            color: ratio >= 2 ? '#047857' : ratio >= 1 ? '#92400e' : '#991b1b'
                        }}>
                            {ratio >= 2 ? '✓ High Engagement' : ratio >= 1 ? '○ Moderate' : '⚠️ Low Engagement'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>

                {/* Post Status Distribution - Pie Chart */}
                <div className="section-card">
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 600, color: '#111827' }}>
                        📈 Post Status Distribution
                    </h3>
                    {statusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.Unknown} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                            No post data available
                        </div>
                    )}

                    {/* Legend */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                        {statusData.map((entry, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: COLORS[entry.name] || COLORS.Unknown
                                }}></div>
                                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                    {entry.name} ({entry.count})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Engagement Comparison - Bar Chart */}
                <div className="section-card">
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 600, color: '#111827' }}>
                        📊 Engagement Overview
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={engagementData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="name" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                {engagementData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Engagement Ratio Visual Card */}
            <div className="section-card" style={{ marginTop: '1.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontWeight: 600, color: '#111827' }}>
                    💡 Engagement Quality Analysis
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem'
                }}>
                    <div style={{
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                        borderRadius: '12px',
                        color: 'white'
                    }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            {totalPosts}
                        </div>
                        <div style={{ opacity: 0.9 }}>Total Posts Created</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.5rem' }}>
                            Content foundation
                        </div>
                    </div>

                    <div style={{
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                        borderRadius: '12px',
                        color: 'white'
                    }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            {totalComments}
                        </div>
                        <div style={{ opacity: 0.9 }}>Total Comments</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.5rem' }}>
                            User engagement
                        </div>
                    </div>

                    <div style={{
                        padding: '1.5rem',
                        background: `linear-gradient(135deg, ${ratio >= 2 ? '#10b981' : ratio >= 1 ? '#f59e0b' : '#ef4444'} 0%, ${ratio >= 2 ? '#059669' : ratio >= 1 ? '#d97706' : '#dc2626'} 100%)`,
                        borderRadius: '12px',
                        color: 'white'
                    }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            {ratio.toFixed(1)}
                        </div>
                        <div style={{ opacity: 0.9 }}>Avg Comments/Post</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.5rem', fontWeight: 600 }}>
                            {ratio >= 2 ? '🎉 Excellent!' : ratio >= 1 ? '👍 Good' : '📈 Needs boost'}
                        </div>
                    </div>

                    <div style={{
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                        borderRadius: '12px',
                        color: 'white'
                    }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            {totalReports}
                        </div>
                        <div style={{ opacity: 0.9 }}>Content Reports</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.5rem' }}>
                            Moderation queue
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Indicator */}
            <div className="section-card" style={{ marginTop: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', fontWeight: 600, color: '#111827' }}>
                    🎯 Community Health Score
                </h3>
                <div style={{ position: 'relative', height: '80px' }}>
                    {/* Progress bar */}
                    <div style={{
                        width: '100%',
                        height: '40px',
                        background: '#f3f4f6',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <div style={{
                            width: `${Math.min((ratio / 3) * 100, 100)}%`,
                            height: '100%',
                            background: ratio >= 2 ? 'linear-gradient(90deg, #10b981, #059669)' : ratio >= 1 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #ef4444, #dc2626)',
                            borderRadius: '20px',
                            transition: 'width 0.5s ease',
                            display: 'flex',
                            alignItems: 'center',
                            paddingLeft: '1rem',
                            color: 'white',
                            fontWeight: 600
                        }}>
                            {ratio >= 2 ? 'Highly Engaged' : ratio >= 1 ? 'Moderate Engagement' : 'Growing Community'}
                        </div>
                    </div>
                    <div style={{
                        marginTop: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        textAlign: 'center'
                    }}>
                        Based on comment-to-post ratio • Target: 2.0+ for optimal engagement
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostCommentAnalytics;
