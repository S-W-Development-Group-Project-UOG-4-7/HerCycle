import { useState, useEffect } from 'react';
import axios from 'axios';
import './FeedbackDisplay.css';

const FeedbackDisplay = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/experiences');
    setFeedbacks(response.data); // ✅ CORRECT: response.data
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
  } finally {
    setLoading(false);
  }
};

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading feedbacks...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <p className="error-text">{error}</p>
      <button className="retry-btn" onClick={fetchFeedbacks}>
        Try Again
      </button>
    </div>
  );

  if (feedbacks.length === 0) return (
    <div className="no-feedback">
      <p>No feedback yet. Be the first to share your experience!</p>
    </div>
  );

  // Calculate statistics
  const totalFeedbacks = feedbacks.length;
  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, fb) => sum + (fb.rating || 0), 0) / feedbacks.length).toFixed(1)
    : 0;
  const fiveStarCount = feedbacks.filter(fb => fb.rating === 5).length;

  return (
    <div className="feedback-display">
      <h2 className="section-title">Customer Feedback</h2>
      
      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{totalFeedbacks}</div>
          <div className="stat-label">Total Feedbacks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{averageRating}</div>
          <div className="stat-label">Average Rating</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{fiveStarCount}</div>
          <div className="stat-label">5-Star Reviews</div>
        </div>
      </div>

      {/* Feedback Grid */}
      <div className="feedback-grid">
        {feedbacks.map(fb => {
          // Get first letter for avatar
          const firstLetter = fb.name ? fb.name.charAt(0).toUpperCase() : 'A';
          
          return (
            <div key={fb._id} className="feedback-card">
              <div className="feedback-header">
                <div className="user-info">
                  <div className="user-avatar">{firstLetter}</div>
                  <div>
                    <div className="user-name">{fb.name || 'Anonymous'}</div>
                    <div className="feedback-date">
                      {new Date(fb.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                <div className="stars">
                  {'★'.repeat(fb.rating || 0)}
                  <span style={{ color: '#666', fontSize: '0.9rem', marginLeft: '5px' }}>
                    ({fb.rating || 0}/5)
                  </span>
                </div>
              </div>
              
              <p className="feedback-text">{fb.experience}</p>
              
              <div className="feedback-footer">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className="category-badge">General</span>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      color: '#666', 
                      marginLeft: '10px',
                      background: '#f5f5f5',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      📧 {fb.email || 'No email'}
                    </span>
                  </div>
                  <div className="feedback-date" style={{ fontSize: '0.8rem' }}>
                    {new Date(fb.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeedbackDisplay;