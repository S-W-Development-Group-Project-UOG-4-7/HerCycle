const express = require('express');
const router = express.Router();
const Experience = require('../models/Experience');

// POST /api/experiences - Create new feedback
router.post('/', async (req, res) => {
    try {
        const { 
            name, email, age, location, 
            experience, category, rating, anonymous 
        } = req.body;

        // Basic validation
        if (!name || !email || !experience || !rating) {
            return res.status(400).json({ 
                error: 'missing_fields', 
                message: 'Name, email, experience, and rating are required.' 
            });
        }

        // Create new experience
        const newExperience = new Experience({
            name: name || 'Anonymous',
            email: email || 'no-email@example.com',
            age: age || 0,
            location: location || 'Not specified',
            experience: experience,
            category: category || 'General',
            rating: Math.min(5, Math.max(1, Number(rating) || 1)),
            anonymous: anonymous || false
        });

        // Save to MongoDB
        const savedExperience = await newExperience.save();
        
        console.log('✅ Feedback saved:', savedExperience._id);
        return res.status(201).json(savedExperience);

    } catch (err) {
        console.error('❌ Error saving feedback:', err);
        return res.status(500).json({ 
            error: 'server_error', 
            message: err.message 
        });
    }
});

// GET /api/experiences - Get all feedbacks
router.get('/', async (req, res) => {
    try {
        const feedbacks = await Experience.find()
            .sort({ createdAt: -1 })
            .limit(100);
        
        return res.json(feedbacks);
    } catch (err) {
        console.error('Error fetching feedbacks:', err);
        return res.status(500).json({ 
            error: 'server_error', 
            message: 'Failed to fetch feedbacks' 
        });
    }
});

// PUT /api/experiences/:id - Update a feedback
router.put('/:id', async (req, res) => {
    try {
        const updated = await Experience.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updated) {
            return res.status(404).json({ error: 'Feedback not found' });
        }
        
        res.json(updated);
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ error: 'Failed to update feedback' });
    }
});

// DELETE /api/experiences/:id - Delete a feedback
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Experience.findByIdAndDelete(req.params.id);
        
        if (!deleted) {
            return res.status(404).json({ error: 'Feedback not found' });
        }
        
        res.json({ message: 'Feedback deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: 'Failed to delete feedback' });
    }
});

// GET /api/experiences/:id - Get single feedback
router.get('/:id', async (req, res) => {
    try {
        const feedback = await Experience.findById(req.params.id);
        
        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }
        
        res.json(feedback);
    } catch (err) {
        console.error('Get single error:', err);
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
});

module.exports = router;  // Make sure this is at the end