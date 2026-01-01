import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    answers: [{
      questionNumber: Number,
      selectedAnswer: {
        type: String,
        enum: ['A', 'B', 'C', 'D'],
      },
      isCorrect: Boolean,
      pointsEarned: Number,
    }],
    score: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    totalPoints: Number,
    pointsEarned: Number,
    passed: {
      type: Boolean,
      default: false,
    },
    timeSpent: Number,
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

export default QuizAttempt;
