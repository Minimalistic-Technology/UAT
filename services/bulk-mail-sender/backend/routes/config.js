const express = require('express');
const router = express.Router();
const Config = require('../models/Config');
const { protect, requireVerified } = require('../middleware/auth');

// All routes protected
router.use(protect);
router.use(requireVerified);

// Get configuration
router.get('/', async (req, res) => {
  try {
    let config = await Config.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    
    if (!config) {
      // Create default config for user
      config = await Config.create({
        user: req.user._id,
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: '',
        smtpPass: ''
      });
    }

    res.json({ config });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update configuration
router.put('/', async (req, res) => {
  try {
    let config = await Config.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    
    if (!config) {
      config = await Config.create({
        ...req.body,
        user: req.user._id
      });
    } else {
      Object.assign(config, req.body);
      await config.save();
    }

    console.log('✅ Configuration updated for user:', req.user._id);

    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;