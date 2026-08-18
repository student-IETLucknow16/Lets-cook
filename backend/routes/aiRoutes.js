const express = require('express');
const rateLimit = require('express-rate-limit');
const { cookingGuidance } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Same pattern as the OTP/login limiters in authRoutes.js — AI calls cost money
// and hit an external API, so they get their own, slightly tighter window.
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 AI requests per IP per window
  message: { success: false, message: 'Too many AI requests, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/cooking-guidance', protect, aiLimiter, cookingGuidance);

module.exports = router;