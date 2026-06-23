const express = require('express');
const { protect } = require('../middleware/auth');
const {
  upload,
  uploadResume,
  getUserResumes,
  getResumeById,
} = require('../controllers/resumeController');

const router = express.Router();

// POST /api/resume/upload  — upload PDF + extract text
router.post('/upload', protect, upload.single('resume'), uploadResume);

// GET /api/resume/:userId  — list user's resumes (without extracted text)
router.get('/:userId', protect, getUserResumes);

// GET /api/resume/detail/:id  — single resume with full text
router.get('/detail/:id', protect, getResumeById);

module.exports = router;
