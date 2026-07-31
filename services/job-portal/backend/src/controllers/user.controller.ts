import type { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import {
  ALLOWED_MIME_TYPES_FOR_AVATAR,
  ALLOWED_MIME_TYPES_FOR_RESUME,
} from "../constants/index.js";
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

    const fieldsToUpdate: any = {};
    if (firstName !== undefined) fieldsToUpdate.firstName = firstName;
    if (lastName !== undefined) fieldsToUpdate.lastName = lastName;
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (skills !== undefined) fieldsToUpdate.skills = skills;
    if (languages !== undefined) fieldsToUpdate.languages = languages;

    if (experience !== undefined) {
      fieldsToUpdate.experiences = {
        deleteMany: {},
        create: experience,
      };
    }

    if (education !== undefined) {
      fieldsToUpdate.educations = {
        deleteMany: {},
        create: education,
      };
    }

    if (location !== undefined) {
      fieldsToUpdate.location = {
        upsert: {
          create: location,
          update: location,
        },
      };
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: fieldsToUpdate,
      include: {
        experiences: true,
        educations: true,
        location: true,
        avatar: true,
        resume: { include: { atsScore: true } },
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Profile updated successfully"));
  } catch (error: any) {
    if (error.code === "P2025") {
      return next(new ApiError(404, "User not found"));
    }
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

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { avatar: true },
    });

    if (user?.avatar?.publicId) {
      await deleteFromCloudinary(user.avatar.publicId, "image");
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      "job_portal/avatars",
      "image",
      `avatar-${req.user.id}-${Date.now()}`,
    );

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        avatar: {
          upsert: {
            create: {
              url: result.secure_url,
              publicId: result.public_id,
            },
            update: {
              url: result.secure_url,
              publicId: result.public_id,
            },
          },
        },
      },
      include: { avatar: true },
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { avatarUrl: updatedUser.avatar?.url },
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

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { resume: true },
    });

    if (user?.resume?.publicId) {
      const isRaw = user.resume.url.includes("/raw/upload/");
      await deleteFromCloudinary(user.resume.publicId, isRaw ? "raw" : "image");
    }

    let atsData: any = null;
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

    const atsScoreCreate = atsData
      ? {
          overallScore: atsData.overallScore,
          sectionScore: atsData.sectionScore,
          formattingScore: atsData.formattingScore,
          keywordScore: atsData.keywordScore,
          contentScore: atsData.contentScore,
          sectionsFound: atsData.sectionsFound || [],
          sectionsMissing: atsData.sectionsMissing || [],
          matchedKeywords: atsData.matchedKeywords || [],
        }
      : undefined;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        resume: {
          upsert: {
            create: {
              url: result.secure_url,
              publicId: result.public_id,
              originalName: req.file.originalname,
              ...(atsScoreCreate
                ? { atsScore: { create: atsScoreCreate } }
                : {}),
            },
            update: {
              url: result.secure_url,
              publicId: result.public_id,
              originalName: req.file.originalname,
              ...(atsScoreCreate
                ? {
                    atsScore: {
                      upsert: {
                        create: atsScoreCreate,
                        update: atsScoreCreate,
                      },
                    },
                  }
                : {}),
            },
          },
        },
      },
      include: {
        resume: {
          include: {
            atsScore: true,
          },
        },
      },
    });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          resumeUrl: updatedUser.resume?.url,
          resumeOriginalName: updatedUser.resume?.originalName,
          atsScore: updatedUser.resume?.atsScore,
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

    const company = await prisma.company.findUnique({
      where: { ownerId: req.user.id },
    });

    if (!company) {
      throw new ApiError(403, "You must create a company first.");
    }

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        companyId: company.id,
        status: "ACTIVE",
      },
    });

    if (!activeSubscription) {
      throw new ApiError(
        403,
        "You must purchase a plan before submitting KYC details.",
      );
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files?.personalDocument?.[0] || !files?.companyDocument?.[0]) {
      throw new ApiError(
        400,
        "Both personal and company documents are required.",
      );
    }

    let existingKyc = await prisma.kYC.findFirst({
      where: { userId: req.user.id, isLatest: true },
    });

    if (existingKyc && existingKyc.status === "APPROVED") {
      throw new ApiError(400, "Your KYC is already approved.");
    }

    if (existingKyc && existingKyc.status === "PENDING") {
      throw new ApiError(400, "Your KYC is already submitted.");
    }

    if (existingKyc && existingKyc.status === "REJECTED") {
      await prisma.kYC.update({
        where: { id: existingKyc.id },
        data: { isLatest: false },
      });
    }

    const isPersonalDocPdf =
      files.personalDocument[0].mimetype === "application/pdf";

    const personalDocResult = await uploadToCloudinary(
      files.personalDocument[0].buffer,
      "job_portal/kyc_personal",
      isPersonalDocPdf ? "raw" : "image",
      `kyc-personal-${company.name}-${req.user.id}-${Date.now()}`,
      isPersonalDocPdf ? "pdf" : undefined,
    );

    const isCompanyDocPdf =
      files.companyDocument[0].mimetype === "application/pdf";

    const companyDocResult = await uploadToCloudinary(
      files.companyDocument[0].buffer,
      "job_portal/kyc_company",
      isCompanyDocPdf ? "raw" : "image",
      `kyc-company-${company.name}-${req.user.id}-${Date.now()}`,
      isCompanyDocPdf ? "pdf" : undefined,
    );

    const companyDoc = await prisma.storageAsset.create({
      data: {
        url: companyDocResult.secure_url,
        publicId: companyDocResult.public_id,
        mimeType: files.companyDocument[0].mimetype,
        sizeBytes: files.companyDocument[0].size,
      },
    });

    const personalDoc = await prisma.storageAsset.create({
      data: {
        url: personalDocResult.secure_url,
        publicId: personalDocResult.public_id,
        mimeType: files.personalDocument[0].mimetype,
        sizeBytes: files.personalDocument[0].size,
      },
    });

    const kyc = await prisma.kYC.create({
      data: {
        userId: req.user.id,
        companyId: company.id,
        companyDocumentType,
        personalDocumentType,
        status: "PENDING",
        companyDocumentId: companyDoc.id,
        personalDocumentId: personalDoc.id,
      },
    });

    const responseToSend = {
      companyDocumentType: kyc.companyDocumentType,
      personalDocumentType: kyc.personalDocumentType,
      documents: {
        personalDocumentUrl: personalDoc.url,
        companyDocumentUrl: companyDoc.url,
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
    if (!req.params.id) {
      throw new ApiError(400, "User id is required");
    }

    const user = await prisma.user.findUnique({
      where: { id: String(req.params.id) },
      include: {
        avatar: true,
        resume: { include: { atsScore: true } },
        experiences: true,
        educations: true,
        location: true,
      },
    });

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
