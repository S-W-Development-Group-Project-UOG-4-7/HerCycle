const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
	// basic required fields for a contact message
	name: { type: String, required: true, trim: true },
	email: { type: String, required: true, trim: true },
	message: { type: String, required: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
