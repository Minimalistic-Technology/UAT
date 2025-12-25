const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  emailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Email',
    required: true
  },
  action: {
    type: String,
    enum: ['queued', 'sent', 'failed', 'retry'],
    required: true
  },
  details: String,
  error: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

emailLogSchema.index({ emailId: 1, timestamp: -1 });

module.exports = mongoose.model('EmailLog', emailLogSchema);