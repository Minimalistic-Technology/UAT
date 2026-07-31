const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Email = require('../models/Email');
const Customer = require('../models/Customer');
const EmailLog = require('../models/EmailLog');
const { protect, requireVerified } = require('../middleware/auth');
const { validateEmail } = require('../utils/validator');

// All routes protected
router.use(protect);
router.use(requireVerified);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  }
});

// Get all emails
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status, user: req.user._id } : { user: req.user._id };

    const emails = await Email.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Email.countDocuments(query);

    res.json({
      emails,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stats
router.get('/stats', async (req, res) => {
  try {
    const [total, sent, failed, pending] = await Promise.all([
      Email.countDocuments({ user: req.user._id }),
      Email.countDocuments({ user: req.user._id, status: 'sent' }),
      Email.countDocuments({ user: req.user._id, status: 'failed' }),
      Email.countDocuments({ user: req.user._id, status: 'pending' })
    ]);

    res.json({ total, sent, failed, pending });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send email with attachments
router.post('/send', upload.array('attachments', 10), async (req, res) => {
  try {
    const { customerIds, subject, body, scheduledFor } = req.body;
    
    // Parse customerIds if it's a string
    const ids = typeof customerIds === 'string' ? JSON.parse(customerIds) : customerIds;

    if (!ids || ids.length === 0) {
      return res.status(400).json({ error: 'No recipients specified' });
    }

    if (!subject || !body) {
      return res.status(400).json({ error: 'Subject and body required' });
    }
console.log('user:', req.user._id);
    // Get customers
    const customers = await Customer.find({
      _id: { $in: ids },
      user: req.user._id,
      status: 'active'
    });

    if (customers.length === 0) {
      return res.status(400).json({ error: 'No valid customers found' });
    }

    const recipients = customers.map(c => c.email);

    // Process attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      path: file.path,
      size: file.size
    })) : [];

    // Create email
    const email = await Email.create({
      user: req.user._id,
      to: recipients,
      subject,
      body,
      scheduledFor: scheduledFor || new Date(),
      attachments,
      metadata: {
        recipientCount: recipients.length.toString()
      }
    });

    await EmailLog.create({
      emailId: email._id,
      action: 'queued',
      details: `Queued ${recipients.length} emails with ${attachments.length} attachments`
    });

    res.status(201).json({
      success: true,
      email,
      recipientCount: recipients.length
    });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get email logs
router.get('/:id/logs', async (req, res) => {
  try {
    const email = await Email.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const logs = await EmailLog.find({ emailId: req.params.id }).sort({ timestamp: -1 });
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel email
router.delete('/:id', async (req, res) => {
  try {
    const email = await Email.findOne({ _id: req.params.id, user: req.user._id });

    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    if (email.status === 'sent') {
      return res.status(400).json({ error: 'Cannot cancel sent email' });
    }

    email.status = 'cancelled';
    await email.save();

    res.json({ success: true, message: 'Email cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;