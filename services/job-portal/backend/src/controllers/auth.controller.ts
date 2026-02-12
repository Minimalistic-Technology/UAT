import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User, { UserRole } from '../models/User.model.js';
import { config } from '../config/env.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { sendEmail } from '../utils/email.js';
// import { sendOTP } from '../utils/sms.js';

// Generate JWT Token
const generateToken = (id: string): string => {
  const jwtOptions = {
    expiresIn: (config.jwtExpire || '7d') as any,
  };
  return jwt.sign({ id }, config.jwtSecret as string, jwtOptions);
};

// Send token response
const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
  const token = generateToken(user._id);

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict' as const,
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { firstName, lastName, email, password, role, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const normalizedRole =
      role === 'employer'
        ? UserRole.EMPLOYER
        : UserRole.JOB_SEEKER;

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: normalizedRole,
      phone,
    });

    // Send verification email
    // const verificationToken = crypto.randomBytes(32).toString('hex');
    // Store token in DB (you'll need to add this field to User model)

    // await sendEmail({
    //   email: user.email,
    //   subject: 'Verify your email',
    //   message: `Click here to verify: ${config.clientUrl}/verify-email/${verificationToken}`,
    // });

    sendTokenResponse(user, 201, res);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
};

// @desc    Send OTP to phone
// @route   POST /api/auth/send-otp
// @access  Public

// export const sendPhoneOTP = async (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { phone } = req.body;

//     // Generate 6-digit OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     // Store OTP in cache/database with expiration (5 minutes)
//     // For now, we'll send it via SMS
//     await sendOTP(phone, otp);

//     res.status(200).json({
//       success: true,
//       message: 'OTP sent successfully',
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       success: false,
//       message: 'Error sending OTP',
//       error: error.message,
//     });
//   }
// };

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone, otp } = req.body;

    // Verify OTP from cache/database
    // If valid, create or login user

    let user = await User.findOne({ phone });

    if (!user) {
      // Create new user with phone
      user = await User.create({
        phone,
        phoneVerified: true,
        firstName: 'User',
        lastName: phone,
        email: `${phone}@temp.com`, // Temporary email
      });
    } else {
      user.phoneVerified = true;
      await user.save();
    }

    sendTokenResponse(user, 200, res);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message,
    });
  }
};

// @desc    Google OAuth callback
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { googleId, email, firstName, lastName, avatar } = req.body;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = await User.create({
        googleId,
        email,
        firstName,
        lastName,
        avatar,
        isVerified: true,
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error with Google authentication',
      error: error.message,
    });
  }
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'There is no user with that email',
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP. Format: salt:hash
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .createHmac('sha256', salt)
      .update(otp)
      .digest('hex');
    const otpToSave = `${salt}:${hash}`;


    // Save to user
    user.resetPasswordOtp = otpToSave;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Send email
    const message = `Your password reset OTP is ${otp}. It is valid for 10 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Valid for 10 mins',
        message,
      });

      res.status(200).json({
        success: true,
        message: 'Email sent',
      });
    } catch (err) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordExpires = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent',
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Verify Reset OTP
// @route   POST /api/auth/verify-reset-otp
// @access  Public
export const verifyResetOTP = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user || !user.resetPasswordOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP or expired',
      });
    }

    const [salt, hash] = user.resetPasswordOtp.split(':');
    const newHash = crypto
      .createHmac('sha256', salt)
      .update(otp)
      .digest('hex');

    if (hash !== newHash) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP Verified',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password } = req.body;

    // Find user by email first, then check expiration manually or in query
    const user = await User.findOne({
      email,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user || !user.resetPasswordOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP or expired',
      });
    }

    // Verify OTP
    const [salt, hash] = user.resetPasswordOtp.split(':');
    const newHash = crypto
      .createHmac('sha256', salt)
      .update(otp)
      .digest('hex');

    if (hash !== newHash) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};