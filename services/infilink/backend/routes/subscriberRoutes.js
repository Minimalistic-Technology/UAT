const express = require('express');
const Subscriber = require('../models/Subscriber');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @desc    Get all subscribers for logged-in user
// @route   GET /api/subscribers
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const subs = await Subscriber.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
    res.json(subs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Add a new subscriber
// @route   POST /api/subscribers
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { userId, email } = req.body;
    if (!userId || !email) return res.status(400).json({ error: 'Missing fields' });

    await Subscriber.updateOne(
      { userId, email: email.toLowerCase() },
      { $setOnInsert: { userId, email: email.toLowerCase() } },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

module.exports = router;
