import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderRole: {
        type: String,
        enum: ['admin', 'lecturer'],
        required: true
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipientRole: {
        type: String,
        enum: ['admin', 'lecturer'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Index for faster queries
MessageSchema.index({ senderId: 1, recipientId: 1 });
MessageSchema.index({ recipientId: 1, read: 1 });

export default mongoose.model('Message', MessageSchema);
