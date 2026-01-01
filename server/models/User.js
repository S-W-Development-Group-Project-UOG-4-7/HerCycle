import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    age: {
      type: Number,
      required: true,
      min: 10,
      max: 18,
    },
    birthday: {
      type: Date,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Please enter a valid email address',
      },
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'non-binary', 'prefer-not-to-say'],
      required: false,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    currentLevel: {
      type: Number,
      default: 1,
    },
    badges: [{
      badgeId: String,
      name: String,
      earnedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    completedModules: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
    }],
    currentStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

export default User;
