import React, { useEffect, useState } from 'react';
import ShareExperience from './ShareExperience';
import './Experiences.css';

export default function Experiences() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    // FIX: Correct API URL
    const API_URL = 'http://localhost:5000/api/experiences';

    const fetchItems = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to load reviews');
            const data = await response.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Fetch Error:', err);
            setError('Could not load reviews. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setModalOpen(true);
    };

    const handleAdded = (newFeedback) => {
    console.log('New feedback added:', newFeedback);
    
    // Add new feedback to beginning of list immediately
    if (newFeedback && newFeedback._id) {
        setItems(prev => [newFeedback, ...prev]);
    }
    
    // Also refresh from server after 1 second
    setTimeout(() => {
        fetchItems();
    }, 1000);
};

    const handleDeleted = (id) => {
        setItems(prev => prev.filter(item => item._id !== id));
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Delete failed');
            
            setItems(prev => prev.filter(item => item._id !== id));
            handleDeleted(id);
            
        } catch (err) {
            console.error('Delete Error:', err);
            alert('Failed to delete review. Please try again.');
        }
    };

    return (
        <div className="experiences-container">
            <div className="experiences-header">
                <h2>Customer Reviews</h2>
                <button onClick={openCreate} className="add-review-btn">
                    + Add Your Review
                </button>
            </div>

            {loading && (
                <div className="loading">
                    Loading reviews...
                </div>
            )}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {!loading && items.length === 0 && (
                <div className="no-reviews">
                    <p>No reviews yet. Be the first to share your experience!</p>
                </div>
            )}

            <div className="reviews-list">
                {items.map(item => (
                    <div key={item._id} className="review-card">
                        <div className="review-header">
                            <div className="reviewer-info">
                                <strong className="reviewer-name">
                                    {item.name || 'Anonymous'}
                                </strong>
                                <span className="review-date">
                                    {new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                                <span className="review-email" style={{ fontSize: '12px', color: '#666' }}>
                                    {item.email}
                                </span>
                            </div>
                            <div className="review-rating">
                                {'★'.repeat(item.rating || 0)}
                                <span style={{ color: '#999', marginLeft: '5px' }}>
                                    ({item.rating || 0}/5)
                                </span>
                            </div>
                        </div>
                        <p className="review-message">
                            {item.experience}
                        </p>
                        <div className="review-actions">
                            <button 
                                onClick={() => openEdit(item)}
                                className="edit-btn"
                            >
                                Edit
                            </button>
                            <button 
                                onClick={() => handleDelete(item._id)}
                                className="delete-btn"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {modalOpen && (
                <ShareExperience
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onAdded={handleAdded}
                    onDeleted={handleDeleted}
                    initialData={editing}
                />
            )}
        </div>
    );
}