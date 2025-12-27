
import React, { useState, useEffect } from "react";
import { feedbackAPI } from "../services/api";
import "./FeedbackDisplay.css";

const FeedbackDisplay = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    useEffect(() => {
        fetchFeedbackData();
    }, []);
    
    const fetchFeedbackData = async () => {
        try {
            setLoading(true);
            
            // Fetch feedback and stats in parallel
            const [feedbackRes, statsRes] = await Promise.all([
                feedbackAPI.getAllFeedback(),
                feedbackAPI.getFeedbackStats()
            ]);
            
            if (feedbackRes.data.success) {
                setFeedbacks(feedbackRes.data.feedbacks);
            }
            
            if (statsRes.data.success) {
                setStats(statsRes.data.stats);
            }
            
        } catch (err) {
            setError("Failed to load feedback data. Make sure backend is running.");
            console.error("Error fetching feedback:", err);
        } finally {
            setLoading(false);
        }
    };
    
    const renderStars = (rating) => {
        return (
            <div className="stars">
                {"★".repeat(rating)}
                {"☆".repeat(5 - rating)}
            </div>
        );
    };
    
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading feedback...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="error-container">
                <p className="error-text">{error}</p>
                <button onClick={fetchFeedbackData} className="retry-btn">
                    Try Again
                </button>
            </div>
        );
    }
    
    return (
        <div className="feedback-display">
            {/* Statistics Cards */}
            {stats && (
                <div className="stats-cards">
                    <div className="stat-card">
                        <div className="stat-value">{stats.averageRating}</div>
                        <div className="stat-label">Average Rating</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">
                            {stats.totalFeedbacks > 1000 
                                ? `${Math.round(stats.totalFeedbacks / 1000)}K+`
                                : stats.totalFeedbacks
                            }
                        </div>
                        <div className="stat-label">Happy Users</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.wouldRecommend}%</div>
                        <div className="stat-label">Would Recommend</div>
                    </div>
                </div>
            )}
            
            {/* Feedback List */}
            <div className="feedback-list">
                <h2 className="section-title">What Our Users Say</h2>
                
                {feedbacks.length === 0 ? (
                    <p className="no-feedback">No feedback yet. Be the first to share!</p>
                ) : (
                    <div className="feedback-grid">
                        {feedbacks.map((feedback) => (
                            <div key={feedback._id} className="feedback-card">
                                <div className="feedback-header">
                                    <div className="user-info">
                                        <div className="user-avatar">
                                            {feedback.userName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="user-name">{feedback.userName}</div>
                                            <div className="feedback-date">
                                                {new Date(feedback.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    {renderStars(feedback.rating)}
                                </div>
                                
                                <p className="feedback-text">{feedback.experience}</p>
                                
                                {feedback.category && (
                                    <span className="category-badge">
                                        {feedback.category}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackDisplay;
