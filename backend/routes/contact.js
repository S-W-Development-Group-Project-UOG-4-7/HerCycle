const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// POST /api/contacts
router.post('/', async (req, res) => {
	// expected body: { name, email, message }
	const { name, email, message } = req.body || {};
	if (!name || !email || !message) return res.status(400).json({ error: 'name, email and message are required' });

	try {
		const created = await Contact.create({ name, email, message });
		return res.status(201).json(created);
	} catch (err) {
		console.error('Contact save error', err);
		return res.status(500).json({ error: 'Unable to save message' });
	}
});

module.exports = router;
