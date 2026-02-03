const express = require('express');
const router = express.Router();
const { protect, doctorOnly } = require('../middleware/auth');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @route   GET /api/doctors/profile
// @desc    Get current doctor's profile
// @access  Private (Doctor only)
router.get('/profile', protect, doctorOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate('user', 'full_name email');
    const doctorObj = doctor.toObject();
    if (doctorObj.user) {
      doctorObj.user.name = doctorObj.user.full_name;
    }
    res.json({ success: true, doctor: doctorObj });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/doctors/profile
// @desc    Update doctor's profile
// @access  Private (Doctor only)
router.put('/profile', protect, doctorOnly, async (req, res) => {
  try {
    const { name, email, specialization, qualifications, experience, bio, contactNumber, clinicAddress, profileImage } = req.body;

    // Update user info
    if (name || email) {
      const updateData = {};
      if (name) updateData.full_name = name;
      if (email) updateData.email = email;

      await User.findByIdAndUpdate(req.user._id, updateData);
    }

    // Update doctor info
    const doctorUpdateData = {};
    if (specialization) doctorUpdateData.specialization = specialization;
    if (qualifications) doctorUpdateData.qualifications = qualifications;
    if (experience !== undefined) doctorUpdateData.experience = experience;
    if (bio) doctorUpdateData.bio = bio;
    if (contactNumber) doctorUpdateData.contactNumber = contactNumber;
    if (clinicAddress) doctorUpdateData.clinicAddress = clinicAddress;
    if (profileImage) doctorUpdateData.profileImage = profileImage;

    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user._id },
      doctorUpdateData,
      { new: true, runValidators: true }
    ).populate('user', 'full_name email');

    const doctorObj = doctor.toObject();
    if (doctorObj.user) {
      doctorObj.user.name = doctorObj.user.full_name;
    }
    res.json({ success: true, doctor: doctorObj });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/doctors/stats
// @desc    Get doctor's dashboard stats
// @access  Private (Doctor only)
router.get('/stats', protect, doctorOnly, async (req, res) => {
  try {
    const Article = require('../models/Article');

    const totalArticles = await Article.countDocuments({ author: req.doctor._id });
    const publishedArticles = await Article.countDocuments({ author: req.doctor._id, status: 'published' });
    const draftArticles = await Article.countDocuments({ author: req.doctor._id, status: 'draft' });

    // Get total views and comments
    const articles = await Article.find({ author: req.doctor._id });
    const totalViews = articles.reduce((sum, article) => sum + article.views, 0);
    const totalComments = articles.reduce((sum, article) => sum + article.comments.length, 0);
    const totalLikes = articles.reduce((sum, article) => sum + article.likes, 0);

    res.json({
      success: true,
      stats: {
        totalArticles,
        publishedArticles,
        draftArticles,
        totalViews,
        totalComments,
        totalLikes
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
