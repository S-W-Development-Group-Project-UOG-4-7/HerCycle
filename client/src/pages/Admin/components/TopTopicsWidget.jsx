// TopTopicsWidget.jsx
import React, { useState, useEffect } from 'react';
import './Widgets.css';

const TopTopicsWidget = () => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/admin/stats/top-topics?limit=5', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setTopics(data.data);
        } catch (error) {
            console.error('Error fetching top topics:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section-card">
            <h3 style={{ marginBottom: '1rem', fontWeight: 600, color: 'rgb(97, 28, 175)' }}>
                🔥 Most Engaged Topics
            </h3>
            <div className="topics-list">
                {loading && <p>Loading...</p>}
                {!loading && topics.length === 0 && (
                    <p style={{ color: '#6b7280', textAlign: 'center' }}>No topics available</p>
                )}
                {topics.map((topic, index) => (
                    <div key={index} className="topic-item">
                        <div>
                            <div className="topic-name">
                                #{index + 1} {topic.category || topic._id}
                            </div>
                        </div>
                        <div className="topic-stats">
                            <span>📝 {topic.post_count} posts</span>
                            <span>❤️ {topic.engagement} engagement</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopTopicsWidget;
