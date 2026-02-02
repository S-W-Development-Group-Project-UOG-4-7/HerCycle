const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  NIC: { type: String },
  full_name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  gender: { type: String },
  contact_number: { type: String },
  date_of_birth: { type: Date },
  role: { type: String, enum: ['user', 'doctor', 'admin'], default: 'user' },
  isExisting: { type: String, enum: ['active', 'pending', 'suspended', 'deleted'], default: 'pending' },
  is_active: { type: Boolean, default: true },
  is_approved: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { collection: 'users' });

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = mongoose.model('User', userSchema);
