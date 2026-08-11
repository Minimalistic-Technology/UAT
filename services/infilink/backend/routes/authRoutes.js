const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');
const verifyRecaptcha = require('../utils/verifyRecaptcha');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

const signToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, handle, recaptchaToken } = req.body;

    if (!name || !email || !password || !handle) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return res.status(400).json({ error: 'Recaptcha verification failed. Please try again.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const cleanHandle = handle.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    if (!cleanHandle) {
      return res.status(400).json({ error: 'Invalid handle' });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const existingHandle = await User.findOne({ handle: cleanHandle });
    if (existingHandle) {
      return res.status(409).json({ error: 'Handle already taken' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      handle: cleanHandle,
      bio: '',
      otpCode,
      otpExpires: Date.now() + 10 * 60 * 1000,
      isVerified: false
    });

    await sendEmail({
      to: user.email,
      subject: 'Verify your email - Infilink',
      htmlContent: `<p>Your verification OTP is: <strong>${otpCode}</strong>. It expires in 10 minutes.</p>`
    });

    res.status(201).json({
      requireOtp: true,
      message: 'OTP sent to your email.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.isVerified) {
      return res.status(400).json({ error: 'User is already verified' });
    }

    if (user.otpLockUntil && user.otpLockUntil > Date.now()) {
      const lockTimeRemainingMs = user.otpLockUntil.getTime() - Date.now();
      return res.status(429).json({
        error: 'Account locked due to too many failed OTP attempts.',
        lockTimeMs: lockTimeRemainingMs
      });
    }

    if (user.otpCode !== otp || !user.otpExpires || user.otpExpires < Date.now()) {
      user.failedOtpAttempts = (user.failedOtpAttempts || 0) + 1;

      if (user.failedOtpAttempts >= 3) {
        user.otpLockUntil = Date.now() + 2 * 60 * 1000;
        await user.save();
        return res.status(429).json({
          error: 'Account locked due to too many failed OTP attempts.',
          lockTimeMs: 2 * 60 * 1000
        });
      }

      await user.save();
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // Correct OTP
    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.failedOtpAttempts = 0;
    user.otpLockUntil = undefined;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Welcome to Infilink! Account Created',
      htmlContent: `<p>Welcome, ${user.name}! Your account has been successfully verified and created.</p>`
    });

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        id: user._id, name: user.name, email: user.email, handle: user.handle,
        bio: user.bio, plan: user.plan, theme: user.theme,
        redirectEnabled: user.redirectEnabled, redirectUrl: user.redirectUrl
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isVerified) return res.status(400).json({ error: 'Already verified' });

    if (user.otpLockUntil && user.otpLockUntil > Date.now()) {
      const lockTimeRemainingMs = user.otpLockUntil.getTime() - Date.now();
      return res.status(429).json({
        error: 'Account locked. Try again later.',
        lockTimeMs: lockTimeRemainingMs
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otpCode;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Verify your email - Infilink (Resend)',
      htmlContent: `<p>Your verification OTP is: <strong>${otpCode}</strong>. It expires in 10 minutes.</p>`
    });

    res.json({ success: true, message: 'OTP resent to email' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Force verify except for older users who might not have had this requirement 
    // Here we strictly check if false (so older users with undefined are not blocked blindly, or you can block all)
    // Based on user prompt: block "new users", but it's best to check exactly false
    if (user.isVerified === false) {
      return res.status(403).json({
        error: 'Email not verified. Please verify your email first.',
        requireOtp: true
      });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const lockTimeRemainingMs = user.lockUntil.getTime() - Date.now();
      return res.status(429).json({
        error: 'Account locked due to too many failed attempts.',
        lockTimeMs: lockTimeRemainingMs
      });
    }

    if (!(await user.matchPassword(password))) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      if (user.failedLoginAttempts >= 3) {
        user.lockUntil = Date.now() + 2 * 60 * 1000;
        await user.save();
        return res.status(429).json({
          error: 'Account locked due to too many failed attempts.',
          lockTimeMs: 2 * 60 * 1000
        });
      }

      await user.save();
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    }

    const token = signToken(user._id);

    // Send login alert (fire and forget)
    if (user.email !== 'admin@gmail.com') {
      sendEmail({
        to: user.email,
        subject: 'New Login Alert - Infilink',
        htmlContent: `<p>Hello ${user.name}, we just noticed a new login to your Infilink account. If this wasn't you, please change your password immediately.</p>`
      }).catch(() => { });
    }

    res.json({
      token,
      user: {
        id: user._id, name: user.name, email: user.email, handle: user.handle,
        bio: user.bio, plan: user.plan, theme: user.theme,
        redirectEnabled: user.redirectEnabled, redirectUrl: user.redirectUrl
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      id: user._id, name: user.name, email: user.email, handle: user.handle,
      bio: user.bio, plan: user.plan, theme: user.theme,
      redirectEnabled: user.redirectEnabled, redirectUrl: user.redirectUrl
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Google OAuth login
// @route   GET /api/auth/google
// @access  Public
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed`, 
    session: false 
  }),
  async (req, res) => {
    try {
      const token = signToken(req.user._id);
      
      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/callback?token=${token}`);
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
  }
);

module.exports = router;
