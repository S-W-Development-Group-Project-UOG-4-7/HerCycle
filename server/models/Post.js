/**
 * Post Model
 * ===========
 * Example Mongoose model for community posts.
 * 
 * Usage: Uncomment and customize for your needs.
 */

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    tag: {
        type: String,
        enum: ['Advice', 'Question', 'Story', 'Tips', 'Other'],
        default: 'Other'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
