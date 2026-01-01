import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema(
  {
    moduleNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: '📚',
    },
    content: {
      sections: [{
        type: {
          type: String,
          enum: ['text', 'image', 'video', 'infographic', 'tip'],
          default: 'text',
        },
        heading: String,
        content: String,
        imageUrl: String,
        videoUrl: String,
        order: Number,
      }],
    },
    keyTakeaways: [String],
    estimatedMinutes: {
      type: Number,
      default: 10,
    },
    difficulty: {
      type: String,
      enum: ['beginner'],
      default: 'beginner',
    },
    prerequisites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
    }],
    pointsValue: {
      type: Number,
      default: 50,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      enum: ['puberty', 'periods', 'hygiene', 'emotions', 'safety', 'body', 'relationships', 'general'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Module = mongoose.model('Module', moduleSchema);

export default Module;
