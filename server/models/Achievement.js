import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    badgeId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    icon: String,
    category: {
      type: String,
      enum: ['milestone', 'streak', 'perfect-score', 'module-completion', 'special'],
    },
    criteria: {
      type: {
        type: String,
        enum: ['modules-completed', 'points-earned', 'perfect-scores', 'streak-days', 'all-modules'],
      },
      threshold: Number,
    },
    pointsReward: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      default: 'common',
    },
  },
  {
    timestamps: true,
  }
);

const Achievement = mongoose.model('Achievement', achievementSchema);

export default Achievement;
