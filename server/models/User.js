import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dob: { type: Date, required: true },
  role: { type: String, enum: ['student', 'lecturer', 'admin'], default: 'student' },

  // This is required to store the Cloudinary URL kyla documentation eke thibba
  profilePic: { type: String, default: "" },

  completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
}, {
  timestamps: true // Adds createdAt and updatedAt
});

export default mongoose.model('User', UserSchema);