const express = require('express');
const router = express.Router();
const { protect, doctorOnly } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const Article = require('../models/Article');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');

// @route   GET /api/articles
// @desc    Get all articles by current doctor
// @access  Private (Doctor only)
router.get('/', protect, doctorOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { author: req.doctor._id };
    if (status) {
      query.status = status;
    }

    const articles = await Article.find(query)
      .populate('categories', 'name slug color')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Article.countDocuments(query);

    res.json({
      success: true,
      articles,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/articles/:id
// @desc    Get single article by ID
// @access  Private (Doctor only)
router.get('/:id', protect, doctorOnly, async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.id,
      author: req.doctor._id
    }).populate('categories', 'name slug color');

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json({ success: true, article });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/articles
// @desc    Create new article
// @access  Private (Doctor only)
router.post('/', [
  protect,
  doctorOnly,
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, content, excerpt, featuredImage, categories, tags, status } = req.body;

    const article = await Article.create({
      title,
      content,
      excerpt,
      featuredImage,
      categories,
      tags,
      status: status || 'draft',
      author: req.doctor._id
    });

    // Update doctor's total articles
    await Doctor.findByIdAndUpdate(req.doctor._id, {
      $inc: { totalArticles: 1 }
    });

    const populatedArticle = await Article.findById(article._id).populate('categories', 'name slug color');

    res.status(201).json({ success: true, article: populatedArticle });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/articles/:id/comments
// @desc    Add a comment to an article
// @access  Private
router.post('/:id/comments', [
  protect,
  body('text').notEmpty().withMessage('Comment text is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const article = await Article.findById(req.params.id).populate('author', 'user');

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const comment = {
      user: req.user._id,
      text: req.body.text
    };

    article.comments.push(comment);
    await article.save();

    const actorName = req.user?.name || 'Someone';
    const authorDoctor = article.author;
    if (authorDoctor && authorDoctor.user?.toString() !== req.user._id.toString()) {
      await Notification.create({
        doctor: authorDoctor._id,
        article: article._id,
        actor: req.user._id,
        type: 'comment',
        title: 'New comment',
        message: `${actorName} commented on "${article.title}".`
      });
    }

    res.status(201).json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/articles/:id/likes
// @desc    Like an article
// @access  Private
router.post('/:id/likes', protect, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate('author', 'user');

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    article.likes += 1;
    await article.save();

    const actorName = req.user?.name || 'Someone';
    const authorDoctor = article.author;
    if (authorDoctor && authorDoctor.user?.toString() !== req.user._id.toString()) {
      await Notification.create({
        doctor: authorDoctor._id,
        article: article._id,
        actor: req.user._id,
        type: 'like',
        title: 'New like',
        message: `${actorName} liked "${article.title}".`
      });
    }

    res.json({ success: true, likes: article.likes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/articles/:id
// @desc    Update article
// @access  Private (Doctor only)
router.put('/:id', protect, doctorOnly, async (req, res) => {
  try {
    const { title, content, excerpt, featuredImage, categories, tags, status } = req.body;

    let article = await Article.findOne({
      _id: req.params.id,
      author: req.doctor._id
    });

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (excerpt) updateData.excerpt = excerpt;
    if (featuredImage) updateData.featuredImage = featuredImage;
    if (categories) updateData.categories = categories;
    if (tags) updateData.tags = tags;
    if (status) updateData.status = status;

    article = await Article.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('categories', 'name slug color');

    res.json({ success: true, article });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/articles/:id
// @desc    Delete article
// @access  Private (Doctor only)
router.delete('/:id', protect, doctorOnly, async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.id,
      author: req.doctor._id
    });

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    await Article.findByIdAndDelete(req.params.id);

    // Update doctor's total articles
    await Doctor.findByIdAndUpdate(req.doctor._id, {
      $inc: { totalArticles: -1 }
    });

    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
