const mongoose = require('mongoose');

/**
 * Resume Schema
 * Stores uploaded resume metadata, raw extracted text, and structured sections.
 * File is stored on disk — only the path is saved here.
 * Designed for future AI integration (sections feed into LLM prompts).
 */
const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
      enum: ['application/pdf'],
    },
    extractedText: {
      type: String,
      default: '',
      maxlength: 50000,
    },
    // ── Structured sections extracted from resume ─────────────
    sections: {
      education: { type: String, default: '' },
      skills: { type: String, default: '' },
      projects: { type: String, default: '' },
      internships: { type: String, default: '' },
      extracurriculars: { type: String, default: '' },
    },
    parsingStatus: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    parsingError: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: efficiently find a user's most recent resume
resumeSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);
