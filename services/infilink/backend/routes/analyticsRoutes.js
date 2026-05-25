const express = require('express');
const Analytics = require('../models/Analytics');
const Link = require('../models/Link');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @desc    Get aggregated analytics
// @route   GET /api/analytics
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.userId;
    const links = await Link.find({ userId }).sort({ order: 1 });
    const events = await Analytics.find({ userId }).lean();

    const totalViews = events.filter(e => e.type === 'page_view').length;
    const totalClicks = events.filter(e => e.type === 'link_click').length;
    const ctr = totalViews > 0 ? `${((totalClicks / totalViews) * 100).toFixed(1)}%` : '0%';

    const linkStats = links.map(link => {
      const clicks = events.filter(e => e.type === 'link_click' && String(e.linkId) === String(link._id)).length;
      return { id: link._id, title: link.title, clicks, views: totalViews };
    });

    res.json({ totalViews, totalClicks, ctr, links: linkStats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Record an analytics event
// @route   POST /api/analytics
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { userId, linkId, type } = req.body;
    if (!userId || !type) return res.status(400).json({ error: 'Missing fields' });
    await Analytics.create({ userId, linkId: linkId || null, type });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
});

module.exports = router;
