const express = require('express');
const multer = require('multer');
const path = require('path');
const passport = require('../config/passport');
const { signup, login, upgradeUser } = require('../controllers/authController');
const { oauthCallback, oauthFailure } = require('../controllers/oauthController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ── Multer config for signup resume upload ───────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `resume-${timestamp}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ── Email / Password Auth ────────────────────────────────────

// POST /api/auth/signup  — accepts optional 'resume' file field
router.post('/signup', upload.single('resume'), signup);

// POST /api/auth/login
router.post('/login', express.json(), login);

// POST /api/auth/upgrade (protected)
router.post('/upgrade', protect, upgradeUser);

// ── Google OAuth ─────────────────────────────────────────────

// GET /api/auth/google — start Google OAuth flow
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// GET /api/auth/google/callback — Google redirects here after consent
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/auth/failure',
    session: false,
  }),
  oauthCallback
);

// ── GitHub OAuth ─────────────────────────────────────────────

// GET /api/auth/github — start GitHub OAuth flow
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'], session: false })
);

// GET /api/auth/github/callback — GitHub redirects here after consent
router.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/api/auth/failure',
    session: false,
  }),
  oauthCallback
);

// ── OAuth failure fallback ───────────────────────────────────
router.get('/failure', oauthFailure);

module.exports = router;
