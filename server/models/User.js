/**
 * User Model
 * ===========
 * Example Mongoose model for user accounts.
 * 
 * Usage: Uncomment and customize for your needs.
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    avatar: {
        initials: String,
        gradient: {
            type: String,
            default: 'from-pink-400 to-purple-500'
        }
    },
    cycleData: {
        lastPeriodStart: Date,
        averageCycleLength: {
            type: Number,
            default: 28
        },
        averagePeriodLength: {
            type: Number,
            default: 5
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
