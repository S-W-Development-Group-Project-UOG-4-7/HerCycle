import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'hercycle-secret-key', {
    expiresIn: '7d',
  });
};

export const signup = async (req, res) => {
  try {
    const { username, age, birthday, email, gender, password } = req.body;

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: { message: 'Username already exists' },
      });
    }

    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: { message: 'Email already registered' },
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      age,
      birthday,
      email,
      gender,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          age: user.age,
          email: user.email,
          gender: user.gender,
          totalPoints: user.totalPoints,
          currentLevel: user.currentLevel,
        },
        token,
      },
      message: 'User created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Please provide username and password' },
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' },
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' },
      });
    }

    user.lastActiveDate = Date.now();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          age: user.age,
          email: user.email,
          gender: user.gender,
          totalPoints: user.totalPoints,
          currentLevel: user.currentLevel,
          currentStreak: user.currentStreak,
        },
        token,
      },
      message: 'Login successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          age: user.age,
          email: user.email,
          gender: user.gender,
          totalPoints: user.totalPoints,
          currentLevel: user.currentLevel,
          currentStreak: user.currentStreak,
          badges: user.badges,
          completedModules: user.completedModules,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
};

export const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful',
  });
};
