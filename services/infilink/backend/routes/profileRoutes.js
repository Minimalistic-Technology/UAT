const express = require('express');
const User = require('../models/User');
const Link = require('../models/Link');
const Analytics = require('../models/Analytics');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @desc    Get my profile
// @route   GET /api/profile
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      id: user._id, name: user.name, email: user.email, handle: user.handle,
      bio: user.bio, plan: user.plan, theme: user.theme,
      redirectEnabled: user.redirectEnabled, redirectUrl: user.redirectUrl
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Update my profile
// @route   PATCH /api/profile
// @access  Private
router.patch('/', protect, async (req, res) => {
  try {
    const { name, bio, theme, redirectEnabled, redirectUrl } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, bio, theme, redirectEnabled, redirectUrl },
      { new: true, runValidators: true }
    );
    res.json({
      id: user._id, name: user.name, bio: user.bio, theme: user.theme,
      redirectEnabled: user.redirectEnabled, redirectUrl: user.redirectUrl
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Get public profile by handle
// @route   GET /api/profile/:handle
// @access  Public
router.get('/:handle', async (req, res) => {
  try {
    const handle = req.params.handle.toLowerCase();
    const user = await User.findOne({ handle });
    if (!user) return res.status(404).json({ error: 'Profile not found' });

    const links = await Link.find({ userId: user._id, isActive: true }).sort({ order: 1 });

    // Record page view analytics
    Analytics.create({ userId: user._id, type: 'page_view' }).catch(console.error);

    res.json({
      user: {
        id: String(user._id),
        name: user.name,
        handle: user.handle,
        bio: user.bio,
        theme: user.theme,
        redirectEnabled: user.redirectEnabled,
        redirectUrl: user.redirectUrl
      },
      links
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
