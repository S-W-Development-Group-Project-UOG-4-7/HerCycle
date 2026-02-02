const express = require('express');
const router = express.Router();
const { protect, doctorOnly } = require('../middleware/auth');
const Notification = require('../models/Notification');

// @route   GET /api/notifications
// @desc    Get notifications for current doctor
// @access  Private (Doctor only)
router.get('/', protect, doctorOnly, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '20', 10);
    const notifications = await Notification.find({ doctor: req.doctor._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('actor', 'name');

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private (Doctor only)
router.put('/:id/read', protect, doctorOnly, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, doctor: req.doctor._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private (Doctor only)
router.put('/read-all', protect, doctorOnly, async (req, res) => {
  try {
    await Notification.updateMany(
      { doctor: req.doctor._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/notifications/clear
// @desc    Clear all notifications
// @access  Private (Doctor only)
router.delete('/clear', protect, doctorOnly, async (req, res) => {
  try {
    await Notification.deleteMany({ doctor: req.doctor._id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
