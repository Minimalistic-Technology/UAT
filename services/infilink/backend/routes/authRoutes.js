const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

const signToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, handle } = req.body;

    if (!name || !email || !password || !handle) {
      return res.status(400).json({ error: 'All fields required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const cleanHandle = handle.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    if (!cleanHandle) {
      return res.status(400).json({ error: 'Invalid handle' });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const existingHandle = await User.findOne({ handle: cleanHandle });
    if (existingHandle) {
      return res.status(409).json({ error: 'Handle already taken' });
    }

    const user = await User.create({ name, email: email.toLowerCase(), password, handle: cleanHandle, bio: '' });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id, name: user.name, email: user.email, handle: user.handle,
        bio: user.bio, plan: user.plan, theme: user.theme,
        redirectEnabled: user.redirectEnabled, redirectUrl: user.redirectUrl,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        id: user._id, name: user.name, email: user.email, handle: user.handle,
        bio: user.bio, plan: user.plan, theme: user.theme,
        redirectEnabled: user.redirectEnabled, redirectUrl: user.redirectUrl
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
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

module.exports = router;
