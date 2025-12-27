const express = require('express');
const router = express.Router();
const Experience = require('../models/Experience');

// POST /api/experiences
router.post('/', async (req, res) => {
	try {
		const { user, message, rating } = req.body || {};
		if (!message || typeof message !== 'string' || !message.trim()) {
			return res.status(400).json({ error: 'message_required', message: 'Feedback message is required.' });
		}
		const r = Number(rating) || 0;
		if (r < 0 || r > 5) return res.status(400).json({ error: 'invalid_rating', message: 'Rating must be between 0 and 5.' });

		const ex = new Experience({
			user: user && String(user).trim() ? String(user).trim() : 'Anonymous',
			message: message.trim(),
			rating: r
		});
		const saved = await ex.save();
		console.log('Saved experience:', saved._id);
		return res.status(201).json(saved);
	} catch (err) {
		console.error('Error saving experience:', err);
		return res.status(500).json({ error: 'server_error', message: 'Failed to save feedback.' });
	}
});

// GET /api/experiences
router.get('/', async (req, res) => {
	try {
		const list = await Experience.find().sort({ createdAt: -1 }).limit(200);
		return res.json(list);
	} catch (err) {
		console.error('Error fetching experiences:', err);
		return res.status(500).json({ error: 'server_error', message: 'Failed to fetch feedback.' });
	}
});

module.exports = router;