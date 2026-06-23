const express = require('express');
const multer = require('multer');
const path = require('path');
const { signup, login } = require('../controllers/authController');

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

// POST /api/auth/signup  — accepts optional 'resume' file field
router.post('/signup', upload.single('resume'), signup);

// POST /api/auth/login
router.post('/login', express.json(), login);

module.exports = router;
