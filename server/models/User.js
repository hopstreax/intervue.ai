const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Supports both email/password auth and OAuth (Google, GitHub).
 * password is optional for OAuth-only users.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never return password by default
      // Not required — OAuth users won't have a password
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // ── OAuth fields ─────────────────────────────────────────────
    googleId: {
      type: String,
      default: null,
      index: true,
    },
    githubId: {
      type: String,
      default: null,
      index: true,
    },
    avatar: {
      type: String,
      default: null, // profile picture URL from OAuth provider
    },
    provider: {
      type: String,
      enum: ['local', 'google', 'github'],
      default: 'local',
    },
    tier: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
    },
  },
  {
    timestamps: true,
  }
);

// ── Index for fast email lookups ──────────────────────────────
userSchema.index({ email: 1 });

// ── Hash password before saving (only if password changed) ───
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Compare entered password with hashed password ────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false; // OAuth users have no password
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
