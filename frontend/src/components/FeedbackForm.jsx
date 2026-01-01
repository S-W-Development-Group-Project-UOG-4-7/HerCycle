import { useState } from 'react';
import axios from 'axios';
import './FeedbackForm.css';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    location: '',
    experience: '',
    category: 'General',
    rating: 5,
    anonymous: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:5000/api/experiences', formData);
      alert('Feedback submitted successfully!');
      setFormData({
        name: '',
        email: '',
        age: '',
        location: '',
        experience: '',
        category: 'General',
        rating: 5,
        anonymous: false
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  return (
    <div className="feedback-form">
      <h2>Share Your Experience</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min="1"
            max="120"
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City, Country"
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select name="category" value={formData.category} onChange={handleChange}>
            <option value="General">General</option>
            <option value="Product">Product</option>
            <option value="Service">Service</option>
            <option value="Support">Support</option>
            <option value="Website">Website</option>
          </select>
        </div>

        <div className="form-group">
          <label>Your Experience *</label>
          <textarea
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            rows="5"
            required
            placeholder="Tell us about your experience..."
          />
        </div>

        <div className="form-group">
          <label>Rating *</label>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className={`star ${star <= formData.rating ? 'active' : ''}`}
                onClick={() => setFormData({...formData, rating: star})}
              >
                ★
              </button>
            ))}
            <input type="hidden" name="rating" value={formData.rating} />
          </div>
        </div>

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="anonymous"
              checked={formData.anonymous}
              onChange={handleChange}
            />
            Submit anonymously
          </label>
        </div>

        <button type="submit" className="submit-btn">
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;