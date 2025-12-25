import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  instructor: String,
  duration: String,
  isRestricted: { type: Boolean, default: false },
  thumbnail: { type: String, default: "" },

  // Track who created this course (for edit permissions)
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Categorize modules
  topic: { type: String, default: "General Health" },

  lessons: [{
    title: String,
    content: String,
    type: { type: String, default: 'text' }
  }],

  quiz: [{
    question: String,
    options: [String],
    correctAnswer: Number
  }],

  // Modification tracking
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  modificationHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ModificationLog'
  }]
}, {
  timestamps: true // This automatically adds createdAt and updatedAt fields
});

export default mongoose.model('Course', CourseSchema);