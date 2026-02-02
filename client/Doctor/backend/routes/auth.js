const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/login
// @desc    Login doctor using main server's users collection
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.role !== 'doctor') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isExisting !== 'active') {
      return res.status(403).json({ message: 'Account pending admin approval' });
    }

    // Find or create Doctor dashboard profile
    let doctorProfile = await Doctor.findOne({ user: user._id });
    if (!doctorProfile) {
      doctorProfile = await Doctor.create({
        user: user._id,
        specialization: 'General',
        qualifications: '',
        experience: 0
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.full_name,
        email: user.email,
        userType: 'doctor'
      },
      doctor: {
        id: doctorProfile._id,
        specialization: doctorProfile.specialization,
        qualifications: doctorProfile.qualifications
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
