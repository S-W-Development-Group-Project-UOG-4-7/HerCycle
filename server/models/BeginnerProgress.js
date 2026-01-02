import mongoose from 'mongoose';

// XP thresholds for each level
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000];
const LEVEL_TITLES = [
    'Curious Learner',    // Level 1
    'Knowledge Seeker',   // Level 2
    'Rising Star',        // Level 3
    'Smart Cookie',       // Level 4
    'Brain Power',        // Level 5
    'Super Scholar',      // Level 6
    'Wisdom Warrior',     // Level 7
    'Master Mind',        // Level 8
    'Legend',             // Level 9
    'Champion'            // Level 10
];

const BeginnerProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    // XP & Leveling
    totalXP: { type: Number, default: 0 },
    level: { type: Number, default: 1, min: 1, max: 10 },

    // Completed lessons tracking
    completedLessons: [{
        lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'BeginnerLesson' },
        completedAt: { type: Date, default: Date.now },
        xpEarned: { type: Number, default: 0 },
        quizScore: { type: Number, default: 0 } // Percentage
    }],

    // Achievements/Badges
    achievements: [{
        id: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String },
        icon: { type: String },
        unlockedAt: { type: Date, default: Date.now }
    }],

    // Streak tracking
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivityDate: { type: Date },

    // Category progress (percentage completed)
    categoryProgress: {
        'Body Basics': { type: Number, default: 0 },
        'Emotions & Feelings': { type: Number, default: 0 },
        'Healthy Habits': { type: Number, default: 0 },
        'Growing Up': { type: Number, default: 0 },
        'Staying Safe': { type: Number, default: 0 }
    },

    // Stats
    totalLessonsCompleted: { type: Number, default: 0 },
    totalQuizzesPassed: { type: Number, default: 0 },
    perfectScores: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Static method to calculate level from XP
BeginnerProgressSchema.statics.calculateLevel = function (xp) {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_THRESHOLDS[i]) {
            return i + 1;
        }
    }
    return 1;
};

// Static method to get level title
BeginnerProgressSchema.statics.getLevelTitle = function (level) {
    return LEVEL_TITLES[level - 1] || 'Learner';
};

// Static method to get XP needed for next level
BeginnerProgressSchema.statics.getXPForNextLevel = function (level) {
    if (level >= 10) return LEVEL_THRESHOLDS[9];
    return LEVEL_THRESHOLDS[level];
};

// Static method to get level thresholds
BeginnerProgressSchema.statics.getLevelThresholds = function () {
    return LEVEL_THRESHOLDS;
};

// Static method to get level titles
BeginnerProgressSchema.statics.getLevelTitles = function () {
    return LEVEL_TITLES;
};

export default mongoose.model('BeginnerProgress', BeginnerProgressSchema);
