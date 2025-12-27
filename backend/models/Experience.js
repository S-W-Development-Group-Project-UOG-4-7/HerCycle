
const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number, required: true },
    location: { type: String, required: true },
    experience: { type: String, required: true },
    category: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    anonymous: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Experience', experienceSchema);
