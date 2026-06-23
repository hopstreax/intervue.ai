const express = require('express');
const { protect } = require('../middleware/auth');
const { startInterview, chatInterview } = require('../controllers/interviewController');

const router = express.Router();

// Real-Time Chat API
router.post('/start', protect, startInterview);
router.post('/chat', protect, chatInterview);

module.exports = router;
