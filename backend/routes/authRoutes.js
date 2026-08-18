const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  verifyEmail,
  resendOTP,
  login,
  googleAuth,
  googleCallback,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  logout,
} = require('../controllers/authController');

const router = express.Router();

// Rate Limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 login requests per window
  message: { success: false, message: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 OTP requests per window
  message: { success: false, message: 'Too many OTP requests, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication routes
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', otpLimiter, resendOTP);
router.post('/login', loginLimiter, login);

// Google OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Password recovery
router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

// Logout
router.post('/logout', logout);

module.exports = router;
