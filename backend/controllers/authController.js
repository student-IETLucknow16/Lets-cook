const User = require('../models/User');
const OTP = require('../models/OTP');
const generateOTP = require('../utils/generateOTP');
const generateToken = require('../utils/generateToken');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const googleAuthService = require('../services/googleAuthService');
const jwt = require('jsonwebtoken');

// Expiration time for OTPs in milliseconds (10 minutes)
const OTP_EXPIRE_TIME = 10 * 60 * 1000;

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  try {
    // 1. Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // 2. Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ success: false, message: 'Email is already registered' });
      } else {
        // If user registered but is not verified, we can update their name/password and send a new OTP
        user.name = name;
        user.password = password;
        await user.save();
      }
    } else {
      // Create new user (unverified by default)
      user = await User.create({
        name,
        email,
        password,
        isVerified: false,
      });
    }

    // 3. Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRE_TIME);

    // 4. Invalidate any existing OTPs
    await OTP.deleteMany({ userId: user._id, type: 'email_verification' });

    // 5. Store hashed OTP in database
    await OTP.create({
      userId: user._id,
      hashedOtp: otpCode,
      type: 'email_verification',
      expiresAt,
    });

    // 6. Send OTP to email
    await sendVerificationEmail(user.email, user.name, otpCode);

    res.status(201).json({
      success: true,
      message: 'Registration initiated. Please verify your email using the OTP sent.',
      email: user.email,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

/**
 * @desc    Verify email using OTP
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    // Find OTP entry
    const otpRecord = await OTP.findOne({ userId: user._id, type: 'email_verification' });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new one.' });
    }

    // Check expiration
    if (new Date() > otpRecord.expiresAt) {
      await OTP.findByIdAndDelete(otpRecord._id);
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }

    // Check attempts limit
    if (otpRecord.attempts >= 5) {
      await OTP.findByIdAndDelete(otpRecord._id);
      return res.status(400).json({ success: false, message: 'Max attempts exceeded. Please request a new OTP.' });
    }

    // Check match
    const isMatch = await otpRecord.matchOtp(otp);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Success - mark user verified
    user.isVerified = true;
    await user.save();

    // Clean up OTP record
    await OTP.findByIdAndDelete(otpRecord._id);

    // Auto-login after verification
    generateToken(res, user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ success: false, message: 'Server error during verification' });
  }
};

/**
 * @desc    Resend verification OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
const resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Standard message even if user not found to prevent user enumeration
      return res.status(200).json({ success: true, message: 'If the email is valid, a new OTP code has been sent.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    // Check cooldown to avoid spamming
    const existingOtp = await OTP.findOne({ userId: user._id, type: 'email_verification' });
    if (existingOtp) {
      const timeSinceCreation = Date.now() - new Date(existingOtp.createdAt).getTime();
      if (timeSinceCreation < 60000) { // 60 seconds cooldown
        return res.status(429).json({ success: false, message: 'Please wait 60 seconds before requesting another OTP.' });
      }
    }

    // Invalidate old OTPs
    await OTP.deleteMany({ userId: user._id, type: 'email_verification' });

    // Generate and save new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRE_TIME);

    await OTP.create({
      userId: user._id,
      hashedOtp: otpCode,
      type: 'email_verification',
      expiresAt,
    });

    // Send email
    await sendVerificationEmail(user.email, user.name, otpCode);

    res.status(200).json({
      success: true,
      message: 'A new OTP has been sent to your email.',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error during OTP request' });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // If not verified, throw warning and do not sign in
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        isVerifiedRequired: true,
        message: 'Please verify your email address before logging in.',
      });
    }

    // Generate JWT cookie
    generateToken(res, user._id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

/**
 * @desc    Google OAuth Login
 * @route   GET /api/auth/google
 * @access  Public
 */
const googleAuth = (req, res) => {
  try {
    const authUrl = googleAuthService.getAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error('Google auth init error:', error);
    res.status(500).json({ success: false, message: 'Failed to initialize Google Authentication' });
  }
};

/**
 * @desc    Google OAuth Callback
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
const googleCallback = async (req, res) => {
  const { code } = req.query;

  try {
    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL || 'https://lets-cook-1.onrender.com'}/login?error=Google auth failed: missing code`);
    }

    const googleUser = await googleAuthService.getUserInfoFromCode(code);
    
    // Find or create user
    let user = await User.findOne({ email: googleUser.email });

    if (user) {
      // Account exists. If it has no googleId, link google account.
      if (!user.googleId) {
        user.googleId = googleUser.googleId;
      }
      // Since Google verified the email, we mark verified.
      user.isVerified = true;
      await user.save();
    } else {
      // Create a verified user with no password
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.googleId,
        isVerified: true,
      });
    }

    // Generate JWT in cookie
    generateToken(res, user._id);

    // Redirect to frontend dashboard or home
    res.redirect(`${process.env.FRONTEND_URL || 'https://lets-cook-1.onrender.com'}/dashboard`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'https://lets-cook-1.onrender.com'}/login?error=Google authentication failed`);
  }
};

/**
 * @desc    Forgot Password - Request OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    
    // Return success regardless of existence to prevent user enumeration
    const successResponse = {
      success: true,
      message: 'If the email is registered, a password reset code has been sent.',
    };

    if (!user) {
      return res.status(200).json(successResponse);
    }

    // Cooldown check
    const existingOtp = await OTP.findOne({ userId: user._id, type: 'password_reset' });
    if (existingOtp) {
      const timeSinceCreation = Date.now() - new Date(existingOtp.createdAt).getTime();
      if (timeSinceCreation < 60000) {
        return res.status(429).json({ success: false, message: 'Please wait 60 seconds before requesting another OTP.' });
      }
    }

    // Invalidate existing reset OTPs
    await OTP.deleteMany({ userId: user._id, type: 'password_reset' });

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRE_TIME);

    await OTP.create({
      userId: user._id,
      hashedOtp: otpCode,
      type: 'password_reset',
      expiresAt,
    });

    // Send reset email
    await sendPasswordResetEmail(user.email, user.name, otpCode);

    res.status(200).json(successResponse);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error processing request' });
  }
};

/**
 * @desc    Verify Reset OTP and generate a temporary token
 * @route   POST /api/auth/verify-reset-otp
 * @access  Public
 */
const verifyResetOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    // Find OTP entry
    const otpRecord = await OTP.findOne({ userId: user._id, type: 'password_reset' });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new one.' });
    }

    // Check expiration
    if (new Date() > otpRecord.expiresAt) {
      await OTP.findByIdAndDelete(otpRecord._id);
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }

    // Check attempts limit
    if (otpRecord.attempts >= 5) {
      await OTP.findByIdAndDelete(otpRecord._id);
      return res.status(400).json({ success: false, message: 'Max attempts exceeded. Please request a new OTP.' });
    }

    // Check match
    const isMatch = await otpRecord.matchOtp(otp);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Invalidate the OTP now that it's verified
    await OTP.findByIdAndDelete(otpRecord._id);

    // Generate a temporary password reset token (valid for 10 minutes)
    const resetToken = jwt.sign(
      { id: user._id, purpose: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    res.status(200).json({
      success: true,
      message: 'OTP verified. You can now reset your password.',
      resetToken,
    });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error during OTP verification' });
  }
};

/**
 * @desc    Reset password using reset token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res) => {
  const { resetToken, password, confirmPassword } = req.body;

  try {
    if (!resetToken || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({ success: false, message: 'Invalid token purpose' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    // Update password
    user.password = password;
    await user.save();

    // Invalidate existing user sessions:
    // By changing jwt expiration or resetting user session identifier if we had one.
    // Setting cookie token to null deletes the current resetting user session.
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful. Please login with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error resetting password' });
  }
};

/**
 * @desc    Logout User / Clear Cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0), // Set expiration date to the past
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

module.exports = {
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
};
