import type { Response, NextFunction } from "express";
import User from "../models/User.model.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary
} from "../utils/cloudinary.js";

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

// @desc    Upload avatar
// @route   PUT /api/users/avatar
// @access  Private
export const uploadAvatar = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, "avatars");

    // Delete old avatar if exists
    if (req.user.avatar) {
      const publicUrl = getPublicIdFromUrl(req.user.avatar);
      await deleteFromCloudinary(publicUrl);
    }

    // Update user
    await User.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error uploading avatar",
      error: error.message,
    });
  }
};

// @desc    Upload resume
// @route   PUT /api/users/resume
// @access  Private (Job Seeker)
export const uploadResume = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      'resumes',
      'image',
      `resume-${req.user.id}-${Date.now()}`,
      'pdf'
    );

    // Delete old resume if exists
    if (req.user.resume) {
      const publicUrl = getPublicIdFromUrl(req.user.resume);
      await deleteFromCloudinary(publicUrl);
    }

    // Update user
    await User.findByIdAndUpdate(
      req.user.id,
      { resume: result.secure_url },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error uploading resume",
      error: error.message,
    });
  }
};

// @desc    Submit KYC details (Employer)
// @route   POST /api/users/kyc
// @access  Private (Employer)
export const submitKyc = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { companyName, aadharNo, gstNo, cinNo } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files?.photo?.[0] || !files?.lightbill?.[0]) {
      return res.status(400).json({
        success: false,
        message: "Both photo and lightbill documents are required.",
      });
    }

    // Upload Photo
    const photoResult = await uploadToCloudinary(
      files.photo[0].buffer,
      "kyc_photos",
      "image",
      `kyc-photo-${req.user.id}-${Date.now()}`
    );

    // Upload Lightbill
    const isLightbillPdf = files.lightbill[0].mimetype === "application/pdf";
    const lightbillResult = await uploadToCloudinary(
      files.lightbill[0].buffer,
      "kyc_lightbills",
      isLightbillPdf ? "raw" : "image",
      `kyc-lightbill-${req.user.id}-${Date.now()}`,
      isLightbillPdf ? "pdf" : undefined
    );

    // TODO: Link these details to a proper KYC model or Company model depending on your schema.
    // Right now, simply storing or acknowledging the upload for the process.
    
    // We can also update the global user object to flag that KYC is submitted if exists on schema
    // await User.findByIdAndUpdate(req.user.id, { kycSubmitted: true });

    res.status(200).json({
      success: true,
      message: "KYC Details Submitted Successfully!",
      data: {
        companyName,
        aadharNo,
        gstNo,
        cinNo,
        documents: {
          photoUrl: photoResult.secure_url,
          lightbillUrl: lightbillResult.secure_url
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error submitting KYC documents",
      error: error.message,
    });
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
