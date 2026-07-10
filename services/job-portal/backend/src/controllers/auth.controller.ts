import type { Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {prisma} from "../lib/prisma.js"
import { config } from "../config/env.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { sendEmail } from "../utils/email.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { generateToken } from "../utils/jwt.js";
import { GlobalRole } from "../../generated/prisma/client.js";

const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
  const token = generateToken(user.id);

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "strict" as const,
  };

  let payload: Record<string, any> = {};

  if (user.role === GlobalRole.SUPER_ADMIN) {
    payload = {
      id: user.id,
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
      id: user.id,
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

const checkAndEnforceOTPBlock = async (email: string) => {
  const tempUser = await prisma.tempUser.findUnique({ where: { email } })
  if (!tempUser) return null;

  if (tempUser.blockedUntil && tempUser.blockedUntil > new Date()) {
    const remainingTime = Math.ceil((tempUser.blockedUntil.getTime() - Date.now()) / 60000);
    throw new ApiError(429, `Too many OTP requests. Please wait ${remainingTime} minutes before trying again.`);
  }

  if (tempUser.blockedUntil && tempUser.blockedUntil <= new Date()) {
    await prisma.tempUser.update({
      where: { email },
      data: {
        blockedUntil: null,
        resendAttempts: 0
      }
    });
  }
  return tempUser;
};

export const requestUserRegistration = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    await checkAndEnforceOTPBlock(email);

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      const companyOwner = await prisma.company.findUnique({
        where: { ownerId: existingUser.id },
      });

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

    await prisma.tempUser.upsert({
      where: { email },
      update: {
        firstName,
        lastName,
        password: hashedPassword,
        role: GlobalRole.USER,
        phone,
        otp: `${salt}:${hashedOtp}`,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      },
      create: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: GlobalRole.USER,
        phone,
        otp: `${salt}:${hashedOtp}`,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      }
    });

    await sendEmail({
      email,
      subject: "Verify your email - Registration OTP",
      message: `Your registration OTP is ${otp}. It expires in 10 minutes.`,
    });

    res.status(200).json(new ApiResponse(200, null, "OTP sent to email"));
  } catch (error: any) {
    next(error);
  }
};

export const requestEmployerRegistration = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      email,
      companyName,
      companyRole,
      industry,
      password,
      firstName,
      lastName,
      phone,
    } = req.body;

    await checkAndEnforceOTPBlock(email);

    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const existingCompany = await prisma.company.findFirst({
        where: {
          ownerId: user.id,
          name: {
            equals: companyName,
            mode: 'insensitive'
          }
        },
      });

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

    let hashedPassword = "";
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    await prisma.tempUser.upsert({
      where: { email },
      update: {
        firstName,
        lastName,
        password: hashedPassword,
        role: GlobalRole.USER,
        phone,
        isEmployer: true,
        companyName,
        companyRole,
        industry,
        otp: `${salt}:${hashedOtp}`,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      },
      create: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: GlobalRole.USER,
        phone,
        isEmployer: true,
        companyName,
        companyRole,
        industry,
        otp: `${salt}:${hashedOtp}`,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      }
    });

    await sendEmail({
      email,
      subject: "Verify your email - Employer Registration OTP",
      message: `Your registration OTP is ${otp}. It expires in 10 minutes.`,
    });

    res.status(200).json(new ApiResponse(200, null, "OTP sent to email"));
  } catch (error: any) {
    console.error("Registration Error:", error);
    next(error);
  }
};

export const confirmRegistrationOTP = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp } = req.body;

    const tempUser = await prisma.tempUser.findUnique({ where: { email } });
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
      let user = await prisma.user.findUnique({ where: { email }, include: { avatar: true } });
      isNewUser = !user;

      if (isNewUser) {
        user = await prisma.user.create({
          data: {
            firstName: tempUser.firstName,
            lastName: tempUser.lastName,
            email: tempUser.email,
            password: tempUser.password,
            phone: tempUser.phone,
            role: tempUser.role,
            isVerified: true,
          },
          include: { avatar: true }
        });
      }

      if (!user) {
        throw new ApiError(500, "Failed to create user");
      }

      let company = await prisma.company.findFirst({
        where: {
          ownerId: user.id,
          name: {
            equals: tempUser.companyName || '',
            mode: 'insensitive'
          }
        }
      });

      if (!company) {
        const slug = (tempUser.companyName || "company").toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + crypto.randomBytes(4).toString("hex");
        
        company = await prisma.company.create({
          data: {
            name: tempUser.companyName || "Unknown",
            slug,
            industry: tempUser.industry || "Unknown",
            ownerId: user.id,
          }
        });
      }
      
      const existingMember = await prisma.companyMember.findFirst({
        where: {
          userId: user.id,
          companyId: company.id
        }
      });

      if (!existingMember) {
        await prisma.companyMember.create({
          data: {
            userId: user.id,
            companyId: company.id,
            role: (tempUser.companyRole as any) || "OWNER"
          }
        });
      }

      userToReturn = {
        ...user,
        isEmployee: true,
        companyId: company?.id || null,
        companyRole: tempUser.companyRole || "OWNER",
      };
    } else {
      const newUser = await prisma.user.create({
        data: {
          firstName: tempUser.firstName,
          lastName: tempUser.lastName,
          email: tempUser.email,
          password: tempUser.password,
          phone: tempUser.phone,
          role: tempUser.role,
          isVerified: true,
        },
        include: { avatar: true }
      });
      
      userToReturn = {
        ...newUser,
        isEmployee: false,
        companyId: null,
        companyRole: null,
      };
    }

    await prisma.tempUser.delete({ where: { id: tempUser.id } });

    return sendTokenResponse(userToReturn, isNewUser ? 201 : 200, res);
  } catch (error: any) {
    next(error);
  }
};

export const resendRegistrationOTP = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;

    const tempUser = await prisma.tempUser.findUnique({ where: { email } });

    if (!tempUser) {
      throw new ApiError(
        404,
        "Registration session expired or not found. Please start over.",
      );
    }

    if (tempUser.blockedUntil && tempUser.blockedUntil > new Date()) {
      const remainingTime = Math.ceil(
        (tempUser.blockedUntil.getTime() - Date.now()) / 60000
      );
      throw new ApiError(
        429,
        `Too many resend attempts. Please wait ${remainingTime} minutes.`
      );
    }

    let { blockedUntil, resendAttempts } = tempUser;

    if (blockedUntil && blockedUntil <= new Date()) {
      blockedUntil = null;
      resendAttempts = 0;
    }

    resendAttempts = (resendAttempts || 0) + 1;
    let expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    if (resendAttempts > 3) {
      blockedUntil = new Date(Date.now() + 30 * 60 * 1000); 
      expiresAt = new Date(Date.now() + 30 * 60 * 1000); 
      
      await prisma.tempUser.update({
        where: { email },
        data: { blockedUntil, expiresAt, resendAttempts }
      });
      throw new ApiError(
        429,
        "Too many resend attempts. You have been blocked from sending OTPs for 30 minutes."
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = crypto.randomBytes(16).toString("hex");
    const hashedOtp = crypto
      .createHmac("sha256", config.otpSecret!)
      .update(otp)
      .digest("hex");

    await prisma.tempUser.update({
      where: { email },
      data: {
        otp: `${salt}:${hashedOtp}`,
        expiresAt,
        resendAttempts,
        blockedUntil
      }
    });

    await sendEmail({
      email,
      subject: "Verify your email - Resend OTP",
      message: `Your new registration OTP is ${otp}. It expires in 10 minutes.`,
    });

    res.status(200).json(new ApiResponse(200, null, "OTP resent to email"));
  } catch (error: any) {
    next(error);
  }
};

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { avatar: true }
    });

    if (!user || !user.password) {
      return next(new ApiError(401, "Invalid credentials"));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(new ApiError(401, "Invalid credentials"));
    }

    if (!user.isActive) {
      return next(
        new ApiError(
          403,
          "Access denied. This account has been deactivated. Please contact support.",
        ),
      );
    }

    if (user.role === GlobalRole.SUPER_ADMIN) {
      sendTokenResponse(user, 200, res);
    } else if (user.role === GlobalRole.USER) {
      const company = await prisma.company.findUnique({
        where: { ownerId: user.id },
      });

      const isEmployee = !!company;
      const companyId = company?.id ?? null;
      const companyRole = isEmployee ? "OWNER" : null;

      sendTokenResponse(
        {
          ...user,
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
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { avatar: true }
    });
    
    if (!user) throw new ApiError(404, "User not found");

    const company = await prisma.company.findUnique({ where: { ownerId: user.id } });

    // TODO: Change this and make it dynamic when you add features schema
    const allowedFeatures: string[] = [];

    const userObj = {
      ...user,
      isEmployee: !!company,
      companyId: company?.id || null,
      companyRole: company ? "OWNER" : null,
      allowedFeatures
    };

    res
      .status(200)
      .json(new ApiResponse(200, userObj, "User fetched successfully"));
  } catch (error: any) {
    next(error);
  }
};

export const verifyOTP = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { phone, otp } = req.body;

    let user = await prisma.user.findFirst({ 
      where: { phone: phone },
      include: { avatar: true }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          firstName: "User",
          lastName: phone,
          email: `${phone}@temp.com`, 
          isVerified: true, 
        },
        include: { avatar: true }
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
        include: { avatar: true }
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error: any) {
    next(error)
  }
};

export const googleAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { googleId, email, firstName, lastName, avatar } = req.body;

    let user = await prisma.user.findFirst({ 
      where: { 
        OR: [
          { googleId },
          { email }
        ] 
      },
      include: { avatar: true }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId,
          email,
          firstName,
          lastName,
          isVerified: true,
          avatar: avatar ? {
            create: {
              url: avatar,
              publicId: "google-avatar",
            }
          } : undefined
        },
        include: { avatar: true }
      });
    }

    let isEmployee = false;
    let companyId = null;
    let companyRole = null;

    if (user.role === GlobalRole.USER) {
      const company = await prisma.company.findUnique({ where: { ownerId: user.id } });
      if (company) {
        isEmployee = true;
        companyId = company.id;
        companyRole = "OWNER";
      }
    }

    sendTokenResponse(
      {
        ...user,
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
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
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
      .createHmac("sha256", config.otpSecret!)
      .update(resetToken)
      .digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordOtp: hashedToken,
        resetPasswordExpires: new Date(Date.now() + 10 * 60 * 1000)
      }
    });

    try {
      const resetUrl = `${config.clientUrl}/reset-password/${resetToken}`;

      await sendEmail({
        email: user.email,
        subject: "Your Password Reset Link",
        message: `You requested a password reset. Please click on the following link to reset your password:\n\n${resetUrl}\n\nThis link is valid for 10 minutes. If you did not request this, please ignore this email.`,
      });

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
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordOtp: null,
          resetPasswordExpires: null
        }
      });
      console.error("Email Delivery Failed:", emailError);
      throw new ApiError(500, "Failed to send email. Please try again later.");
    }
  } catch (error: any) {
    next(error);
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
      .createHmac("sha256", config.otpSecret!)
      .update(token as string)
      .digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordOtp: hashedToken,
        resetPasswordExpires: { gt: new Date() },
      },
      include: { avatar: true }
    });

    if (!user) {
      return next(new ApiError(400, "Invalid or expired reset token"));
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordOtp: null,
        resetPasswordExpires: null
      },
      include: { avatar: true }
    });

    sendTokenResponse(updatedUser, 200, res);
  } catch (error: any) {
    next(error);
  }
};
