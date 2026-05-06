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
import {ALLOWED_MIME_TYPES_FOR_AVATAR, ALLOWED_MIME_TYPES_FOR_RESUME} from "../constants/index.js";

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      skills,
      languages,
      experience,
      education,
      location,
    } = req.body;

    const fieldsToUpdate: any = {
      firstName,
      lastName,
      phone,
      skills,
      languages,
      experience,
      education,
      location,
    };

    Object.keys(fieldsToUpdate).forEach(
      (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key],
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Profile updated successfully"));
  } catch (error: any) {
    next(error);
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

    if (!ALLOWED_MIME_TYPES_FOR_AVATAR.includes(req.file.mimetype)) {
      throw new ApiError(400, "Only images are allowed");
    }
    if (req.user.avatar?.publicId) {
      await deleteFromCloudinary(req.user.avatar.publicId, "image");
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      "job-portal/avatars",
      "image",
      `avatar-${req.user.id}-${Date.now()}`,
    );

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        avatar: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
      { new: true },
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { avatarUrl: updatedUser?.avatar?.url },
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

    if (!ALLOWED_MIME_TYPES_FOR_RESUME.includes(req.file.mimetype)) {
      throw new ApiError(400, "Only PDF files are allowed");
    }

    if (req.user.resume?.publicId) {
      const isRaw = req.user.resume?.url.includes("/raw/upload/");
      await deleteFromCloudinary(
        req.user.resume?.publicId,
        isRaw ? "raw" : "image",
      );
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      "job-portal/resumes",
      "raw",
      `resume-${req.user.id}-${Date.now()}`,
      "pdf",
    );

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        resume: {
          url: result.secure_url,
          publicId: result.public_id,
        },
        resumeOriginalName: req.file.originalname,
      },
      { new: true },
    );

    res.status(200).json(
      new ApiResponse(
        200,
        {
          resumeUrl: updatedUser?.resume?.url,
          resumeOriginalName: updatedUser?.resumeOriginalName,
        },
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

    if (existingKyc && existingKyc.status === "rejected") {
      existingKyc.isLatest = false;
      await existingKyc.save();
    }

    const photoResult = await uploadToCloudinary(
      files.photo[0].buffer,
      "job_portal/kyc_photos",
      "image",
      `kyc-photo-${req.user.id}-${Date.now()}`,
    );

    const isLightbillPdf = files.lightbill[0].mimetype === "application/pdf";

    const lightbillResult = await uploadToCloudinary(
      files.lightbill[0].buffer,
      "job_portal/kyc_lightbills",
      isLightbillPdf ? "raw" : "image",
      `kyc-lightbill-${req.user.id}-${Date.now()}`,
    );

    const kycData = {
      user: req.user.id,
      companyName,
      aadharNo,
      gstNo,
      cinNo,
      photo: {
        url: photoResult.secure_url,
        publicId: photoResult.public_id,
      },
      lightbill: {
        url: lightbillResult.secure_url,
        publicId: lightbillResult.public_id,
      },
      status: "pending" as const,
    };

    const kyc = await KYC.create(kycData);

    if (!kyc) {
      // optionally delete the uploaded images
      await Promise.allSettled([
        deleteFromCloudinary(photoResult.public_id),
        deleteFromCloudinary(lightbillResult.public_id),
      ]);

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
        photoUrl: kyc?.photo.url,
        lightbillUrl: kyc?.lightbill.url,
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

export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "User fetched successfully"));
  } catch (error: any) {
    next(error);
  }
};
