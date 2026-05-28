const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema(
  {
    linkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['page_view', 'link_click'], required: true },
  },
  { timestamps: true }
);

AnalyticsSchema.index({ userId: 1, createdAt: -1 });

const Analytics = mongoose.model('Analytics', AnalyticsSchema);
module.exports = Analytics;
