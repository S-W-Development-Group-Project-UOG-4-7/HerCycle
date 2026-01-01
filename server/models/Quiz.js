import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    questions: [{
      questionNumber: {
        type: Number,
        required: true,
      },
      questionText: {
        type: String,
        required: true,
      },
      options: [{
        optionLetter: {
          type: String,
          enum: ['A', 'B', 'C', 'D'],
        },
        text: String,
      }],
      correctAnswer: {
        type: String,
        enum: ['A', 'B', 'C', 'D'],
        required: true,
      },
      explanation: {
        type: String,
        required: true,
      },
      pointsValue: {
        type: Number,
        default: 10,
      },
    }],
    passingScore: {
      type: Number,
      default: 60,
    },
    totalPoints: {
      type: Number,
      default: 100,
    },
    timeLimit: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
