const mongoose = require('mongoose');

/**
 * Analytics Schema
 * Aggregated performance data per user — one document per user.
 * Updated after every evaluation.
 */
const analyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one analytics doc per user
      index: true,
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    totalInterviews: {
      type: Number,
      default: 0,
    },
    totalResponses: {
      type: Number,
      default: 0,
    },
    weakAreas: {
      type: [String],
      default: [],
    },
    progress: [
      {
        date: { type: Date, default: Date.now },
        score: { type: Number, min: 0, max: 10 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Analytics', analyticsSchema);
