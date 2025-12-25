import mongoose from 'mongoose';

const ModificationLogSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        // Not required because course might be deleted
    },
    courseTitle: {
        type: String,
        required: true
    },
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    modifierName: {
        type: String,
        required: true
    },
    modifierRole: {
        type: String,
        enum: ['admin', 'lecturer'],
        required: true
    },
    action: {
        type: String,
        enum: ['edit', 'delete', 'create'],
        required: true
    },
    reason: {
        type: String,
        required: true,
        minlength: 10
    },
    changes: {
        type: mongoose.Schema.Types.Mixed, // Flexible object to store what changed
        default: {}
    },
    originalCreator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    originalCreatorName: {
        type: String
    },
    // Notification tracking
    notificationSent: {
        type: Boolean,
        default: false
    },
    notificationRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for faster queries
ModificationLogSchema.index({ courseId: 1 });
ModificationLogSchema.index({ modifiedBy: 1 });
ModificationLogSchema.index({ originalCreator: 1, notificationRead: 1 });
ModificationLogSchema.index({ createdAt: -1 }); // For recent activity

export default mongoose.model('ModificationLog', ModificationLogSchema);
