const express = require('express');
const router = express.Router();
const Template = require('../models/Template');
const { protect, requireVerified } = require('../middleware/auth');

// All routes are protected
router.use(protect);
router.use(requireVerified);

// Get all templates
router.get('/', async (req, res) => {
  try {
    const templates = await Template.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ templates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create template
router.post('/', async (req, res) => {
  try {
    const { name, subject, body } = req.body;

    const template = await Template.create({
      user: req.user._id,
      name,
      subject,
      body
    });

    res.status(201).json({ success: true, template });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update template
router.put('/:id', async (req, res) => {
  try {
    let template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Check ownership
    if (template.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    template = await Template.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, template });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete template
router.delete('/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (template.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await template.deleteOne();

    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;