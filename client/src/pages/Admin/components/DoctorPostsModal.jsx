// DoctorPostsModal.jsx
// PHASE 3: Modal to view all posts created by a specific doctor
// Used during verification to assess doctor's content quality and professional conduct
import React, { useState, useEffect, useCallback } from 'react';
import './DoctorPostsModal.css';

const DoctorPostsModal = ({ doctorNIC, doctorName, onClose }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    // useCallback to prevent unnecessary re-renders and satisfy ESLint dependency rules
    const fetchDoctorPosts = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:5000/api/admin/doctor-posts/${doctorNIC}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setPosts(data.data.posts || []);
                setTotalCount(data.data.total_count || 0);
            }
        } catch (error) {
            console.error('Error fetching doctor posts:', error);
        } finally {
            setLoading(false);
        }
    }, [doctorNIC]); // Dependency: re-fetch when doctorNIC changes

    useEffect(() => {
        fetchDoctorPosts();
    }, [fetchDoctorPosts]); // Now fetchDoctorPosts is a stable reference

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getCategoryColor = (category) => {
        const colors = {
            general: '#3b82f6',
            health: '#10b981',
            education: '#8b5cf6',
            experience: '#db2777',
            question: '#f59e0b',
            support: '#14b8a6'
        };
        return colors[category] || '#6b7280';
    };

    const getStatusBadgeColor = (status) => {
        const colors = {
            pending: '#f59e0b',
            approved: '#10b981',
            rejected: '#ef4444',
            flagged: '#dc2626'
        };
        return colors[status] || '#6b7280';
    };

    return (
        <div className="doctor-posts-modal-overlay" onClick={onClose}>
            <div className="doctor-posts-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">📝 Posts by Dr. {doctorName}</h2>
                        <p className="modal-subtitle">Total: {totalCount} posts</p>
                    </div>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                {/* Content */}
                <div className="modal-content">
                    {loading ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Loading posts...</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📭</div>
                            <h3>No Posts Yet</h3>
                            <p>This doctor hasn't created any posts in the community.</p>
                        </div>
                    ) : (
                        <div className="posts-list">
                            {posts.map((post, index) => (
                                <div key={post._id || index} className="post-card">
                                    <div className="post-header">
                                        <div>
                                            <h3 className="post-title">{post.title}</h3>
                                            <div className="post-meta">
                                                <span className="post-date">{formatDate(post.created_at)}</span>
                                                <span
                                                    className="post-category"
                                                    style={{
                                                        backgroundColor: `${getCategoryColor(post.category)}20`,
                                                        color: getCategoryColor(post.category),
                                                        border: `1px solid ${getCategoryColor(post.category)}`
                                                    }}
                                                >
                                                    {post.category}
                                                </span>
                                                <span
                                                    className="post-status"
                                                    style={{
                                                        backgroundColor: `${getStatusBadgeColor(post.approval_status)}20`,
                                                        color: getStatusBadgeColor(post.approval_status),
                                                        border: `1px solid ${getStatusBadgeColor(post.approval_status)}`
                                                    }}
                                                >
                                                    {post.approval_status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="post-content">
                                        {post.content?.length > 200
                                            ? `${post.content.substring(0, 200)}...`
                                            : post.content}
                                    </p>
                                    <div className="post-stats">
                                        <span className="stat">👁️ {post.view_count || 0} views</span>
                                        <span className="stat">❤️ {post.like_count || 0} likes</span>
                                        <span className="stat">💬 {post.comment_count || 0} comments</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button className="primary-btn" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default DoctorPostsModal;
