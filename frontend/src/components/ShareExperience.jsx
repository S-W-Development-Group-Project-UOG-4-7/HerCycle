import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ShareExperience.css';

export default function ShareExperience({ open, onClose, onAdded, onDeleted, initialData = null }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [experience, setExperience] = useState('');
    const [rating, setRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const API_URL = 'http://localhost:5000/api/experiences';

    useEffect(() => {
        if (open && initialData) {
            setName(initialData.name || '');
            setEmail(initialData.email || '');
            setExperience(initialData.experience || '');
            setRating(initialData.rating || 0);
            setError(''); 
            setSuccess('');
        } else if (open && !initialData) {
            setName(''); 
            setEmail(''); 
            setExperience(''); 
            setRating(0); 
            setError(''); 
            setSuccess('');
        }
    }, [open, initialData]);

    if (!open) return null;

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        // Basic validation
        if (!experience.trim()) { 
            setError('Please enter your experience'); 
            return; 
        }
        if (!email.trim()) { 
            setError('Please enter your email'); 
            return; 
        }
        if (rating < 1) { 
            setError('Please select a rating'); 
            return; 
        }
        
        setSubmitting(true);
        try {
            const payload = {
                name: name.trim() || 'Anonymous',
                email: email.trim(),
                experience: experience.trim(),
                rating: rating
            };

            console.log('Submitting:', payload);

            let response;
            
            if (initialData && initialData._id) {
                // UPDATE existing feedback
                response = await axios.put(`${API_URL}/${initialData._id}`, payload);
                setSuccess('Feedback updated successfully!');
            } else {
                // CREATE new feedback
                response = await axios.post(API_URL, payload);
                setSuccess('Feedback submitted successfully!');
            }
            
            console.log('Response:', response.data);
            
            if (onAdded) onAdded(response.data);
            
            // Reset form and close after success
            setTimeout(() => {
                setSuccess('');
                if (onClose) onClose();
                // Reset form
                if (!initialData) {
                    setName('');
                    setEmail('');
                    setExperience('');
                    setRating(0);
                }
            }, 1500);
            
        } catch (err) {
            console.error('Error:', err);
            setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!(initialData && initialData._id)) return;
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        
        try {
            await axios.delete(`${API_URL}/${initialData._id}`);
            if (onDeleted) onDeleted(initialData._id);
            if (onClose) onClose();
        } catch (err) {
            console.error('Delete Error:', err);
            setError('Failed to delete: ' + err.message);
        }
    };

    return (
        <div className="share-experience-overlay">
            <form onSubmit={submit} className="share-experience-modal">
                <div className="share-experience-header">
                    <h3>{initialData ? 'Edit Your Review' : 'Share Your Experience'}</h3>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="share-experience-close-btn"
                    >
                        ×
                    </button>
                </div>

                {/* Show original email reference when editing */}
                {initialData && initialData._id && (
                    <div style={{ 
                        backgroundColor: '#f8f9fa', 
                        padding: '10px', 
                        borderRadius: '6px',
                        marginBottom: '15px',
                        fontSize: '14px'
                    }}>
                        <strong>Original Email:</strong> {initialData.email}
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                            You can update your name, experience, and rating.
                        </div>
                    </div>
                )}

                <div className="share-experience-form-group">
                    <label className="share-experience-label">
                        Name (optional)
                    </label>
                    <input 
                        type="text"
                        value={name} 
                        onChange={e => setName(e.target.value)}
                        placeholder="Your name"
                        className="share-experience-input"
                    />
                </div>

                <div className="share-experience-form-group">
                    <label className="share-experience-label">
                        Email *
                    </label>
                    <input 
                        type="email"
                        value={email} 
                        onChange={e => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="share-experience-input"
                        readOnly={initialData && initialData._id} // Can't change email when editing
                        style={initialData && initialData._id ? { backgroundColor: '#f5f5f5' } : {}}
                    />
                    {initialData && initialData._id && (
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                            Email cannot be changed when updating.
                        </div>
                    )}
                </div>

                <div className="share-experience-form-group">
                    <label className="share-experience-label">
                        Your Experience *
                    </label>
                    <textarea 
                        value={experience} 
                        onChange={e => setExperience(e.target.value)}
                        placeholder="Share your experience..."
                        rows="4"
                        required
                        className="share-experience-textarea"
                    />
                </div>

                <div className="share-experience-form-group">
                    <label className="share-experience-label">
                        Rating *
                    </label>
                    <div className="share-experience-stars">
                        {[1, 2, 3, 4, 5].map(n => (
                            <button
                                type="button"
                                key={n}
                                onClick={() => setRating(n)}
                                className={`share-experience-star-btn ${n <= rating ? 'active' : ''}`}
                                aria-label={`Rate ${n} stars`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="share-experience-error">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="share-experience-success">
                        {success}
                    </div>
                )}

                <div className="share-experience-actions">
                    {initialData && initialData._id && (
                        <button 
                            type="button" 
                            onClick={handleDelete} 
                            disabled={submitting}
                            className="share-experience-btn delete"
                        >
                            Delete
                        </button>
                    )}
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={submitting}
                        className="share-experience-btn cancel"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="share-experience-btn submit"
                    >
                        {submitting ? 'Saving...' : (initialData ? 'Update' : 'Submit')}
                    </button>
                </div>
            </form>
        </div>
    );
}