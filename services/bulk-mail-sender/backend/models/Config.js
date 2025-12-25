const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  smtpHost: {
    type: String,
    required: true,
    default: 'smtp.gmail.com'
  },
  smtpPort: {
    type: Number,
    required: true,
    default: 587
  },
  smtpUser: {
    type: String,
    required: true
  },
  smtpPass: {
    type: String,
    required: true
  },
  scheduleDays: {
    type: [String],
    default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  },
  startTime: {
    type: String,
    default: '10:00'
  },
  endTime: {
    type: String,
    default: '17:00'
  },
  retryAttempts: {
    type: Number,
    default: 3
  },
  retryDelay: {
    type: Number,
    default: 5
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Config', configSchema);