const express = require('express');
const { protect } = require('../middleware/auth');
const {
  upload,
  uploadResume,
  getUserResumes,
  getResumeById,
} = require('../controllers/resumeController');

const router = express.Router();

// POST /api/resume/upload - upload PDF and extract text.
router.post('/upload', protect, upload.single('resume'), uploadResume);

// Keep specific routes before parameterized routes.
router.get('/detail/:id', protect, getResumeById);

// GET /api/resume/:userId - list user's resumes without extracted text.
router.get('/:userId', protect, getUserResumes);

module.exports = router;
