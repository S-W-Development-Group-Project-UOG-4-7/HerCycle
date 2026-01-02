import mongoose from 'mongoose';

const StudentDeletionLogSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    studentEmail: {
        type: String,
        required: true
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lecturerName: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true,
        minlength: 10
    },
    // Notification tracking
    notificationRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for faster queries
StudentDeletionLogSchema.index({ deletedBy: 1 });
StudentDeletionLogSchema.index({ notificationRead: 1 });
StudentDeletionLogSchema.index({ createdAt: -1 }); // For recent activity

export default mongoose.model('StudentDeletionLog', StudentDeletionLogSchema);
