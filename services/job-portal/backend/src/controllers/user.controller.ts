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
import Subscription from "../models/Subscription.model.js";
import CompanyMember from "../models/CompanyMember.model.js";
import { extractText } from "../lib/ats/extract-text.js";
import { scoreResume } from "../lib/ats/scrorer.js";

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
      returnDocument: "after",
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
      "job_portal/avatars",
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
      { returnDocument: "after" },
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

    let atsData = null;
    try {
      const text = await extractText(req.file.buffer, req.file.mimetype);
      atsData = scoreResume(text);
    } catch (e) {
      console.error("Failed to calculate ATS score on resume upload:", e);
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      "job_portal/resumes",
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
        ...(atsData ? { atsScore: atsData } : {}),
      },
      { returnDocument: "after" },
    );

    res.status(200).json(
      new ApiResponse(
        200,
        {
          resumeUrl: updatedUser?.resume?.url,
          resumeOriginalName: updatedUser?.resumeOriginalName,
          atsScore: atsData,
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
    const { companyDocumentType, personalDocumentType } = req.body;

    const companyMember = await CompanyMember.findOne({ user: req.user.id, isActive: true });
    if (!companyMember) {
      throw new ApiError(403, "You must create a company first.");
    }

    const activeSubscription = await Subscription.findOne({
      companyId: companyMember.company,
      status: "active",
    });

    if (!activeSubscription) {
      throw new ApiError(403, "You must purchase a plan before submitting KYC details.");
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files?.personalDocument?.[0] || !files?.companyDocument?.[0]) {
      throw new ApiError(
        400,
        "Both personal and company documents are required.",
      );
    }

    let existingKyc = await KYC.findOne({ user: req.user.id });

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

    const isPersonalDocPdf = files.personalDocument[0].mimetype === "application/pdf";
    const personalDocResult = await uploadToCloudinary(
      files.personalDocument[0].buffer,
      "job_portal/kyc_personal",
      isPersonalDocPdf ? "raw" : "image",
      `kyc-personal-${req.user.id}-${Date.now()}`,
      isPersonalDocPdf ? "pdf" : undefined,
    );

    const isCompanyDocPdf = files.companyDocument[0].mimetype === "application/pdf";
    const companyDocResult = await uploadToCloudinary(
      files.companyDocument[0].buffer,
      "job_portal/kyc_company",
      isCompanyDocPdf ? "raw" : "image",
      `kyc-company-${req.user.id}-${Date.now()}`,
      isCompanyDocPdf ? "pdf" : undefined,
    );

    const kycData = {
      user: req.user.id,
      companyDocumentType,
      personalDocumentType,
      personalDocument: {
        url: personalDocResult.secure_url,
        publicId: personalDocResult.public_id,
      },
      companyDocument: {
        url: companyDocResult.secure_url,
        publicId: companyDocResult.public_id,
      },
      status: "pending" as const,
    };

    const kyc = await KYC.create(kycData);

    if (!kyc) {
      // optionally delete the uploaded images
      await Promise.allSettled([
        deleteFromCloudinary(personalDocResult.public_id),
        deleteFromCloudinary(companyDocResult.public_id),
      ]);

      throw new ApiError(
        500,
        "Failed to submit KYC details. Please try again later.",
      );
    }

    const responseToSend = {
      companyDocumentType: kyc?.companyDocumentType,
      personalDocumentType: kyc?.personalDocumentType,
      documents: {
        personalDocumentUrl: kyc?.personalDocument.url,
        companyDocumentUrl: kyc?.companyDocument.url,
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
