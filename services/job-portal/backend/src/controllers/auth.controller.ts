import type { Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User, { GlobalRole } from "../models/User.model.js";
import { config } from "../config/env.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { sendEmail } from "../utils/email.js";
// import { sendOTP } from '../utils/sms.js';
import CompanyMember from "../models/CompanyMember.model.js";
import Company from "../models/Company.model.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import TempUser from "../models/TempUser.model.js";
import { generateToken } from "../utils/jwt.js";
import Feature, { FeatureStatus } from "../models/Feature.model.js";
import FeaturePermission from "../models/FeaturePermission.model.js";

const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
  const token = generateToken(user._id);

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "strict" as const,
  };

  let payload: Record<string, any> = {};

  if (user.role === GlobalRole.SUPER_ADMIN) {
    payload = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token,
    };
  }

  if (user.role === GlobalRole.USER) {
    payload = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmployee: user.isEmployee,
      companyId: user.companyId,
      companyRole: user.companyRole,
      token,
    };
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json(new ApiResponse(statusCode, payload, "Login successful"));
};

export const requestUserRegistration = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email }).session(session);

    if (existingUser) {
      const companyOwner = await Company.findOne({
        owner: existingUser._id,
      }).session(session);

      if (companyOwner) {
        return next(
          new ApiError(
            400,
            "You're register as employer with us. you can't create a normal job seeker account with the same email. please use different email",
          ),
        );
      }

      return next(new ApiError(400, "User already exists with this email"));
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = crypto.randomBytes(16).toString("hex");
    const hashedOtp = crypto
      .createHmac("sha256", config.otpSecret!)
      .update(otp)
      .digest("hex");

    const hashedPassword = await bcrypt.hash(password, 12);

    await TempUser.findOneAndUpdate(
      { email },
      {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: GlobalRole.USER,
        phone,
        otp: `${salt}:${hashedOtp}`,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      },
      { upsert: true, session, runValidators: true },
    ).session(session);

    await sendEmail({
      email,
      subject: "Verify your email - Registration OTP",
      message: `Your registration OTP is ${otp}. It expires in 10 minutes.`,
    });

    await session.commitTransaction();
    res.status(200).json(new ApiResponse(200, null, "OTP sent to email"));
  } catch (error: any) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const requestEmployerRegistration = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      email,
      companyName,
      role,
      industry,
      password,
      firstName,
      lastName,
      phone,
    } = req.body;

    let user = await User.findOne({ email }).session(session);

    if (user) {
      const existingCompany = await Company.findOne({
        owner: user._id,
        name: { $regex: new RegExp(`^${companyName}$`, "i") },
      }).session(session);

      if (existingCompany) {
        throw new ApiError(400, "You are already registered with this company or email");
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = crypto.randomBytes(16).toString("hex");
    const hashedOtp = crypto
      .createHmac("sha256", config.otpSecret!)
      .update(otp)
      .digest("hex");

    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    await TempUser.findOneAndUpdate(
      { email },
      {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: GlobalRole.USER,
        phone,
        isEmployer: true,
        companyName,
        companyRole: role,
        industry,
        otp: `${salt}:${hashedOtp}`,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      },
      { upsert: true, session, runValidators: true },
    ).session(session);

    await sendEmail({
      email,
      subject: "Verify your email - Employer Registration OTP",
      message: `Your registration OTP is ${otp}. It expires in 10 minutes.`,
    });

    await session.commitTransaction();
    res.status(200).json(new ApiResponse(200, null, "OTP sent to email"));
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Registration Error:", error);
    next(error);
  } finally {
    session.endSession();
  }
};

export const confirmRegistrationOTP = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, otp } = req.body;

    const tempUser = await TempUser.findOne({ email })
      .select("+password")
      .session(session);
    if (!tempUser) {
      throw new ApiError(
        404,
        "Registration session expired or not found. Please register again.",
      );
    }

    const [salt, storedHash] = tempUser.otp.split(":");
    const computedHash = crypto
      .createHmac("sha256", config.otpSecret!)
      .update(otp)
      .digest("hex");

    const storedHashBuffer = Buffer.from(storedHash);
    const computedHashBuffer = Buffer.from(computedHash);

    if (
      storedHashBuffer.length !== computedHashBuffer.length ||
      !crypto.timingSafeEqual(storedHashBuffer, computedHashBuffer)
    ) {
      throw new ApiError(401, "Invalid OTP code");
    }

    let userToReturn;
    let isNewUser = true;

    if (tempUser.isEmployer) {
      let user = await User.findOne({ email }).session(session);
      isNewUser = !user;

      if (isNewUser) {
        user = await User.create(
          [
            {
              firstName: tempUser.firstName,
              lastName: tempUser.lastName,
              email: tempUser.email,
              password: tempUser.password,
              phone: tempUser.phone,
              role: tempUser.role,
              isVerified: true,
            },
          ],
          { session },
        ).then((res) => res[0]);
      }

      if (!user) {
        throw new ApiError(500, "Failed to create user");
      }

      const existingCompany = await Company.findOne({
        owner: user._id,
        name: { $regex: new RegExp(`^${tempUser.companyName}$`, "i") },
      }).session(session);

      if (!existingCompany) {
        const [company] = await Company.create(
          [
            {
              name: tempUser.companyName,
              industry: tempUser.industry,
              owner: user._id,
            },
          ],
          { session },
        );

        await CompanyMember.create(
          [
            {
              user: user._id,
              company: company._id,
              role: tempUser.companyRole,
            },
          ],
          { session },
        );
      }
      const membership = await CompanyMember.findOne({ user: user._id }).session(session);

      userToReturn = {
        ...user.toObject(),
        isEmployee: true,
        companyId: membership?.company || null,
        companyRole: membership?.role || null,
      };
    } else {
      const [newUser] = await User.create(
        [
          {
            firstName: tempUser.firstName,
            lastName: tempUser.lastName,
            email: tempUser.email,
            password: tempUser.password,
            phone: tempUser.phone,
            role: tempUser.role,
            isVerified: true,
          },
        ],
        { session },
      );
      userToReturn = {
        ...newUser.toObject(),
        isEmployee: false,
        companyId: null,
        companyRole: null,
      };
    }

    await TempUser.deleteOne({ _id: tempUser._id }).session(session);

    await session.commitTransaction();

    return sendTokenResponse(userToReturn, isNewUser ? 201 : 200, res);
  } catch (error: any) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    next(error);
  } finally {
    session.endSession();
  }
};

export const resendRegistrationOTP = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email } = req.body;

    const tempUser = await TempUser.findOne({ email }).session(session);

    if (!tempUser) {
      throw new ApiError(
        404,
        "Registration session expired or not found. Please start over.",
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = crypto.randomBytes(16).toString("hex");
    const hashedOtp = crypto
      .createHmac("sha256", config.otpSecret!)
      .update(otp)
      .digest("hex");

    tempUser.otp = `${salt}:${hashedOtp}`;
    tempUser.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // extend by 10 mins

    await tempUser.save({ session, validateBeforeSave: true });

    await sendEmail({
      email,
      subject: "Verify your email - Resend OTP",
      message: `Your new registration OTP is ${otp}. It expires in 10 minutes.`,
    });

    await session.commitTransaction();
    res.status(200).json(new ApiResponse(200, null, "OTP resent to email"));
  } catch (error: any) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    next(error);
  } finally {
    session.endSession();
  }
};

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ApiError(401, "Invalid credentials"));
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return next(new ApiError(401, "Invalid credentials"));
    }

    const isActive = user.isActive;

    if (!isActive) {
      return next(
        new ApiError(
          403,
          "Access denied. This account has been deactivated. Please contact support.",
        ),
      );
    }

    if (user.role === GlobalRole.SUPER_ADMIN) {
      sendTokenResponse(user, 200, res);
    }

    if (user.role === GlobalRole.USER) {
      const membership = await CompanyMember.findOne({
        user: user._id,
      });

      const isEmployee = !!membership;
      const companyId = membership?.company ?? null;
      const companyRole = membership?.role ?? null;

      sendTokenResponse(
        {
          ...user.toObject(),
          isEmployee,
          companyId,
          companyRole,
        },
        200,
        res,
      );
    }
  } catch (error: any) {
    next(error);
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) throw new ApiError(404, "User not found");

    const membership = await CompanyMember.findOne({ user: user._id });

    // 1. Get strictly "public" features
    const publicFeatures = await Feature.find({ status: FeatureStatus.PUBLIC }).select("slug");
    const allowedSlugs = new Set(publicFeatures.map(f => f.slug));

    // 2. Get specific "beta" features this user (or their company) has been granted
    const userPermissions = await FeaturePermission.find({
      $or: [
        { user: user._id },
        ...(membership ? [{ company: membership.company }] : [])
      ]
    }).populate("feature", "slug status");

    userPermissions.forEach(perm => {
      const f: any = perm.feature;
      if (f && f.status === FeatureStatus.BETA) {
        allowedSlugs.add(f.slug);
      }
    });

    const userObj = user.toObject();
    (userObj as any).allowedFeatures = Array.from(allowedSlugs);

    res
      .status(200)
      .json(new ApiResponse(200, userObj, "User fetched successfully"));
  } catch (error: any) {
    next(error);
  }
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
  next: NextFunction,
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
        firstName: "User",
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
      message: "Error verifying OTP",
      error: error.message,
    });
  }
};

export const googleAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
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

    let isEmployee = false;
    let companyId = null;
    let companyRole = null;

    if (user.role === GlobalRole.USER) {
      const membership = await CompanyMember.findOne({ user: user._id });
      if (membership) {
        isEmployee = true;
        companyId = membership.company;
        companyRole = membership.role;
      }
    }

    sendTokenResponse(
      {
        ...user.toObject(),
        isEmployee,
        companyId,
        companyRole,
      },
      200,
      res
    );
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error with Google authentication",
      error: error.message,
    });
  }
};

export const forgotPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).session(session);

    if (!user) {
      await session.commitTransaction();
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            null,
            "If the user exists, an OTP has been sent.",
          ),
        );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHmac("sha256", config.otpSecret)
      .update(resetToken)
      .digest("hex");

    user.resetPasswordOtp = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await user.save({ session, validateBeforeSave: false });

    try {
      const resetUrl = `${config.clientUrl}/reset-password/${resetToken}`;

      await sendEmail({
        email: user.email,
        subject: "Your Password Reset Link",
        message: `You requested a password reset. Please click on the following link to reset your password:\n\n${resetUrl}\n\nThis link is valid for 10 minutes. If you did not request this, please ignore this email.`,
      });

      await session.commitTransaction();

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            null,
            "If the user exists, a password reset link has been sent.",
          ),
        );
    } catch (emailError) {
      await session.abortTransaction();
      console.error("Email Delivery Failed:", emailError);
      throw new ApiError(500, "Failed to send email. Please try again later.");
    }
  } catch (error: any) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    next(error);
  } finally {
    session.endSession();
  }
};

export const resetPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return next(new ApiError(400, "Reset token is missing"));
    }

    const hashedToken = crypto
      .createHmac("sha256", config.otpSecret)
      .update(token as string)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordOtp: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return next(new ApiError(400, "Invalid or expired reset token"));
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error: any) {
    next(error);
  }
};
