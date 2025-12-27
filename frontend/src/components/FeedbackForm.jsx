
import React, { useState } from "react";
import { feedbackAPI } from "../services/api";
import "./FeedbackForm.css";

const FeedbackForm = ({ onFeedbackSubmit }) => {
    const [formData, setFormData] = useState({
        userName: "",
        userEmail: "",
        rating: 5,
        experience: "",
        category: "general",
    });
    
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
    
    const handleRatingClick = (rating) => {
        setFormData({
            ...formData,
            rating: rating,
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage("");
        
        try {
            const response = await feedbackAPI.submitFeedback(formData);
            
            if (response.data.success) {
                setMessage("✅ Thank you for sharing your experience!");
                // Reset form
                setFormData({
                    userName: "",
                    userEmail: "",
                    rating: 5,
                    experience: "",
                    category: "general",
                });
                
                // Notify parent component
                if (onFeedbackSubmit) {
                    onFeedbackSubmit();
                }
            } else {
                setMessage(`❌ ${response.data.message}`);
            }
        } catch (error) {
            setMessage("❌ Error submitting feedback. Please try again.");
            console.error("Feedback submission error:", error);
        } finally {
            setSubmitting(false);
        }
    };
    
    return (
        <div className="feedback-form-container">
            <h2 className="form-title">Share Your Experience</h2>
            
            {message && (
                <div className={`message ${message.includes("✅") ? "success" : "error"}`}>
                    {message}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="feedback-form">
                <div className="form-group">
                    <label htmlFor="userName">Your Name *</label>
                    <input
                        type="text"
                        id="userName"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        required
                        placeholder="Enter your name"
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="userEmail">Email Address *</label>
                    <input
                        type="email"
                        id="userEmail"
                        name="userEmail"
                        value={formData.userEmail}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email"
                    />
                </div>
                
                <div className="form-group">
                    <label>Rating *</label>
                    <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={`star-btn ${star <= formData.rating ? "active" : ""}`}
                                onClick={() => handleRatingClick(star)}
                            >
                                {star <= formData.rating ? "★" : "☆"}
                            </button>
                        ))}
                        <span className="rating-text">{formData.rating} out of 5</span>
                    </div>
                    <input
                        type="hidden"
                        name="rating"
                        value={formData.rating}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                    >
                        <option value="product">Product Experience</option>
                        <option value="service">Customer Service</option>
                        <option value="app">App Experience</option>
                        <option value="general">General Feedback</option>
                    </select>
                </div>
                
                <div className="form-group">
                    <label htmlFor="experience">Your Experience *</label>
                    <textarea
                        id="experience"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        required
                        rows="4"
                        placeholder="Share your detailed experience here..."
                        minLength="10"
                        maxLength="500"
                    />
                    <small className="char-count">
                        {formData.experience.length}/500 characters
                    </small>
                </div>
                
                <button
                    type="submit"
                    className="submit-btn"
                    disabled={submitting}
                >
                    {submitting ? "Submitting..." : "Submit Your Experience"}
                </button>
            </form>
        </div>
    );
};

export default FeedbackForm;
