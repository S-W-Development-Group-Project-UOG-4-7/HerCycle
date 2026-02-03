const express = require('express');
const router = express.Router();
const { protect, doctorOnly } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/categories/:id
// @desc    Get single category
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/categories
// @desc    Create new category
// @access  Private (Doctor only)
router.post('/', [
  protect,
  doctorOnly,
  body('name').notEmpty().withMessage('Category name is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, icon, color } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name,
      description,
      icon,
      color,
      createdBy: req.doctor._id
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private (Doctor only)
router.put('/:id', protect, doctorOnly, async (req, res) => {
  try {
    const { name, description, icon, color, isActive } = req.body;

    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (icon) updateData.icon = icon;
    if (color) updateData.color = color;
    if (isActive !== undefined) updateData.isActive = isActive;

    category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private (Doctor only)
router.delete('/:id', protect, doctorOnly, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
