const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['system', 'user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  feedback: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: [true, 'Target role is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
    model: {
      type: String,
      enum: ['gemini', 'gpt'],
      default: 'gemini',
    },
    history: {
      type: [messageSchema],
      default: [],
    },
    performanceMetrics: {
      clarity: { type: Number, default: 0 },
      accuracy: { type: Number, default: 0 },
      tone: { type: Number, default: 0 },
      questionsAnswered: { type: Number, default: 0 }
    },
    evaluation: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Interview', interviewSchema);
