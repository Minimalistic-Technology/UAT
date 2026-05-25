const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

SubscriberSchema.index({ userId: 1, email: 1 }, { unique: true });

const Subscriber = mongoose.model('Subscriber', SubscriberSchema);
module.exports = Subscriber;
