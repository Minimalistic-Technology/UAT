const express = require('express');
const router = express.Router();
const Email = require('../models/Email');
const Customer = require('../models/Customer');
const EmailLog = require('../models/EmailLog');
const { validateEmail } = require('../utils/validator');

// Get all emails with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};

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

// Get email statistics
router.get('/stats', async (req, res) => {
  try {
    const [total, sent, failed, pending] = await Promise.all([
      Email.countDocuments(),
      Email.countDocuments({ status: 'sent' }),
      Email.countDocuments({ status: 'failed' }),
      Email.countDocuments({ status: 'pending' })
    ]);

    res.json({ total, sent, failed, pending });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ENHANCED: Create emails with batch processing
router.post('/', async (req, res) => {
  try {
    const { to, customerIds, subject, body, scheduledFor } = req.body;

    // Validate required fields
    if (!subject || !body) {
      return res.status(400).json({ error: 'Subject and body are required' });
    }

    let recipients = [];

    // Fetch customer emails if IDs provided
    if (customerIds && customerIds.length > 0) {
      // Limit to prevent memory issues
      if (customerIds.length > 5000) {
        return res.status(400).json({ 
          error: 'Maximum 5000 recipients per batch. Please send in multiple batches.' 
        });
      }

      const customers = await Customer.find({ 
        _id: { $in: customerIds },
        status: 'active'
      }).select('email name').lean();
      
      recipients = customers.map(c => c.email);
    } else if (to) {
      recipients = Array.isArray(to) ? to : [to];
    }

    if (recipients.length === 0) {
      return res.status(400).json({ error: 'No valid recipients found' });
    }

    // Validate all emails
    const invalidEmails = recipients.filter(email => !validateEmail(email));
    if (invalidEmails.length > 0) {
      return res.status(400).json({
        error: 'Invalid email addresses found',
        invalidEmails: invalidEmails.slice(0, 10) // Show first 10
      });
    }

    // Create email document
    const email = await Email.create({
      to: recipients,
      subject,
      body,
      scheduledFor: scheduledFor || new Date(),
      metadata: {
        batchSize: recipients.length.toString(),
        source: 'web_app'
      }
    });

    // Log the creation
    await EmailLog.create({
      emailId: email._id,
      action: 'queued',
      details: `Queued ${recipients.length} emails`
    });

    res.status(201).json({ 
      success: true, 
      email,
      recipientCount: recipients.length
    });
  } catch (error) {
    console.error('Email creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get email logs
router.get('/:id/logs', async (req, res) => {
  try {
    const logs = await EmailLog.find({ emailId: req.params.id })
      .sort({ timestamp: -1 });
    
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel email
router.delete('/:id', async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    
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