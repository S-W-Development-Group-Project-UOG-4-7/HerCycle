import mongoose from 'mongoose';

const BeginnerLessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },

    // Lesson content - can be text, images, or video URLs
    content: { type: String, required: true },
    contentType: { type: String, enum: ['text', 'video', 'interactive'], default: 'text' },

    // Gamification elements
    difficultyLevel: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    xpReward: { type: Number, default: 50 },

    // Visual elements
    thumbnail: { type: String, default: '' },
    icon: { type: String, default: '📚' }, // Emoji icon for fun display
    color: { type: String, default: '#6366f1' }, // Card accent color

    // Organization
    category: {
        type: String,
        enum: ['Body Basics', 'Emotions & Feelings', 'Healthy Habits', 'Growing Up', 'Staying Safe'],
        default: 'Body Basics'
    },
    order: { type: Number, default: 0 }, // Lesson order within category

    // Age appropriateness
    ageRange: {
        min: { type: Number, default: 10 },
        max: { type: Number, default: 15 }
    },

    // Quiz for completion
    quiz: [{
        question: { type: String, required: true },
        options: [{ type: String }],
        correctAnswer: { type: Number, required: true }
    }],

    // Tracking
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPublished: { type: Boolean, default: false },

    // Fun facts shown after completion
    funFact: { type: String, default: '' }
}, {
    timestamps: true
});

export default mongoose.model('BeginnerLesson', BeginnerLessonSchema);
