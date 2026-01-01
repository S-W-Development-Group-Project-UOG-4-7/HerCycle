import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started',
    },
    startedAt: Date,
    completedAt: Date,
    timeSpent: {
      type: Number,
      default: 0,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

export default UserProgress;
