const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const passport = require('./config/passport'); // OAuth strategies

// ── Route imports ─────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const evaluateRoutes = require('./routes/evaluateRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const resumeRoutes = require('./routes/resumeRoutes');

// ── Initialize Express ───────────────────────────────────────
const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize()); // Initialize Passport (no sessions — JWT-based)


// ── API Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/generate-questions', interviewRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/evaluate', evaluateRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/resume', resumeRoutes);

// ── Health check endpoint ────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Intervue.AI API is running 🚀' });
});

// ── Ensure uploads directory exists ──────────────────────────
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── Error handler (must be last middleware) ───────────────────
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 Intervue.AI server running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
};

startServer();
