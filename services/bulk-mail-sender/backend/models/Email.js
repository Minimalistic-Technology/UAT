const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: [String],
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'cancelled'],
    default: 'pending'
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  lastError: String,
  sentAt: Date,
  attachments: [{
    filename: String,
    path: String,
    size: Number
  }],
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
emailSchema.index({ status: 1, scheduledFor: 1, user: 1 });

module.exports = mongoose.model('Email', emailSchema);