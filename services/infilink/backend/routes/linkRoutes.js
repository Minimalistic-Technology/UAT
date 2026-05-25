const express = require('express');
const Link = require('../models/Link');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @desc    Get all user links
// @route   GET /api/links
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const links = await Link.find({ userId: req.userId }).sort({ order: 1 });
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Create a link
// @route   POST /api/links
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, url } = req.body;
    if (!title || !url) return res.status(400).json({ error: 'Title and URL required' });

    const count = await Link.countDocuments({ userId: req.userId });
    const link = await Link.create({ userId: req.userId, title, url, order: count });
    res.status(201).json(link);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Update a link
// @route   PATCH /api/links/:id
// @access  Private
router.patch('/:id', protect, async (req, res) => {
  try {
    const link = await Link.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!link) return res.status(404).json({ error: 'Link not found' });
    res.json(link);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Delete a link
// @route   DELETE /api/links/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const link = await Link.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!link) return res.status(404).json({ error: 'Link not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
