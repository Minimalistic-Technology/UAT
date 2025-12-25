const express = require('express');
const router = express.Router();
const Config = require('../models/Config');

// Get configuration
router.get('/', async (req, res) => {
  try {
    let config = await Config.findOne().sort({ createdAt: -1 });
    
    if (!config) {
      config = await Config.create({});
    }

    res.json({ config });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update configuration
router.put('/', async (req, res) => {
  try {
    let config = await Config.findOne().sort({ createdAt: -1 });
    
    if (!config) {
      config = await Config.create(req.body);
    } else {
      Object.assign(config, req.body);
      await config.save();
    }

    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;