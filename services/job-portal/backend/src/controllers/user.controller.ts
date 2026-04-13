import type { Response, NextFunction } from "express";
import User from "../models/User.model.js";
import KYC from "../models/KYC.model.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

export const getPublicIdFromUrl = (url: string) => {
  const parts = url.split("/");
  const file = parts.slice(-2).join("/"); // resumes/filename.pdf
  const publicId = file.replace(/\.[^/.]+$/, ""); // remove extension
  return publicId;
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const fieldsToUpdate: any = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      skills: req.body.skills,
      languages: req.body.languages,
      experience: req.body.experience,
      education: req.body.education,
      location: req.body.location,
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(
      (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key],
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

export const uploadAvatar = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      throw new ApiError(400, "Please upload a file");
    }

    if (req.user.avatar) {
      const publicId = getPublicIdFromUrl(req.user.avatar);
      await deleteFromCloudinary(publicId, "image");
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      "avatars",
      "image",
      `avatar-${req.user.id}-${Date.now()}`,
    );

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url },
      { new: true },
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { avatarUrl: updatedUser?.avatar },
          "Avatar uploaded successfully",
        ),
      );
  } catch (error: any) {
    next(error);
  }
};

export const uploadResume = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      throw new ApiError(400, "Please upload a file");
    }
    if (req.user.resume) {
      const publicId = getPublicIdFromUrl(req.user.resume);
      await deleteFromCloudinary(publicId, "raw");
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      "resumes",
      "raw",
      `resume-${req.user.id}-${Date.now()}`,
    );

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { resume: result.secure_url },
      { new: true },
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { resumeUrl: updatedUser?.resume },
          "Resume uploaded successfully",
        ),
      );
  } catch (error: any) {
    next(error);
  }
};

export const submitKyc = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { companyName, aadharNo, gstNo, cinNo } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files?.photo?.[0] || !files?.lightbill?.[0]) {
      throw new ApiError(
        400,
        "Both photo and lightbill documents are required.",
      );
    }

    let existingKyc = await KYC.findOne({
      $or: [
        { user: req.user.id },
        // Use a case-insensitive regex to catch "Acme Corp" vs "ACME Corp"
        // { companyName: { $regex: new RegExp(`^${companyName}$`, "i") } },
        // { gstNo },
        // { cinNo },
      ],
    });

    if (existingKyc && existingKyc.status === "approved") {
      throw new ApiError(400, "Your KYC is already approved.");
    }

    if (existingKyc && existingKyc.status === "pending") {
      throw new ApiError(400, "Your KYC is already submitted.");
    }

    const photoResult = await uploadToCloudinary(
      files.photo[0].buffer,
      "kyc_photos",
      "image",
      `kyc-photo-${req.user.id}-${Date.now()}`,
    );

    const isLightbillPdf = files.lightbill[0].mimetype === "application/pdf";
    const lightbillResult = await uploadToCloudinary(
      files.lightbill[0].buffer,
      "kyc_lightbills",
      isLightbillPdf ? "raw" : "image",
      `kyc-lightbill-${req.user.id}-${Date.now()}`,
      isLightbillPdf ? "pdf" : undefined,
    );

    const kycData = {
      user: req.user.id,
      companyName,
      aadharNo,
      gstNo,
      cinNo,
      photoUrl: photoResult.secure_url,
      lightbillUrl: lightbillResult.secure_url,
      status: "pending" as const,
    };

    const kyc = await KYC.create(kycData);

    if (!kyc) {
      // optionally delete the uploaded images
      throw new ApiError(
        500,
        "Failed to submit KYC details. Please try again later.",
      );
    }

    const responseToSend = {
      companyName: kyc?.companyName,
      aadharNo: kyc?.aadharNo,
      gstNo: kyc?.gstNo,
      cinNo: kyc?.cinNo,
      documents: {
        photoUrl: kyc?.photoUrl,
        lightbillUrl: kyc?.lightbillUrl,
      },
    };
    
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          responseToSend,
          "KYC Details Submitted Successfully!",
        ),
      );
  } catch (error: any) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};
