const express = require('express');
const { protect } = require('../middleware/auth');
const { evaluate } = require('../controllers/evaluateController');

const router = express.Router();

// POST /api/evaluate  (protected)
router.post('/', protect, evaluate);

module.exports = router;
