const express = require('express');
const { protect } = require('../middleware/auth');
const { upload, uploadResume } = require('../controllers/uploadController');

const router = express.Router();

// POST /api/upload  (protected — requires JWT)
router.post('/', protect, upload.single('resume'), uploadResume);

module.exports = router;
