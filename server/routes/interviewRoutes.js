const express = require('express');
const { protect } = require('../middleware/auth');
const { startInterview, chatInterview, endInterview, getInterviewSummary } = require('../controllers/interviewController');

const router = express.Router();

// Real-Time Chat API
router.post('/start', protect, startInterview);
router.post('/chat', protect, chatInterview);
router.post('/end', protect, endInterview);
router.get('/summary', protect, getInterviewSummary);

module.exports = router;
