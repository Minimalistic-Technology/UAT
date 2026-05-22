import type { Response, NextFunction } from "express";
import Company from "../models/Company.model.js";
import User, { GlobalRole } from "../models/User.model.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import CompanyMember, { CompanyRole } from "../models/CompanyMember.model.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Job, { JobStatus } from "../models/Job.model.js";
import Subscription from "../models/Subscription.model.js";
import KYC from "../models/KYC.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ALLOWED_MIME_TYPES_FOR_AVATAR } from "../constants/index.js";

// @desc    Create new company
// @route   POST /api/companies
// @access  Super_Admin
export const createCompany = async (req: AuthRequest, res: Response) => {
  const {
    email,
    firstName,
    lastName,
    password,
    phone,
    companyName,
    companyDescription,
    industry,
  } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let owner = await User.findOne({ email }).session(session);

    if (!owner) {
      const ownerRecords = await User.create(
        [
          {
            firstName,
            lastName,
            email,
            password,
            phone,
            role: GlobalRole.USER,
          },
        ],
        { session },
      );

      owner = ownerRecords[0];
    }

    // Check if owner already has a company
    const existingOwnership = await Company.findOne({
      owner: owner._id,
    }).session(session);
    if (existingOwnership) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "This user is already an owner of an existing company.",
      });
    }

    const newCompany = await Company.create(
      [
        {
          name: companyName,
          owner: owner._id,
          description: companyDescription,
          industry,
        },
      ],
      { session },
    );
    const company = newCompany[0];

    await CompanyMember.create(
      [
        {
          user: owner._id,
          company: company._id,
          role: CompanyRole.OWNER,
          isActive: true,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Company and Owner account set up successfully",
      data: {
        company,
        owner: {
          id: owner._id,
          email: owner.email,
          fullName: `${owner.firstName} ${owner.lastName}`,
        },
      },
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      success: false,
      message: "Error creating company",
      error: error.message,
    });
  }
};

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public
export const getCompanies = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      search,
      industry,
      location,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    const query: any = {};

    // Search by name
    if (search) {
      query.name = { $regex: search as string, $options: "i" };
    }

    // Filter by industry
    if (industry) {
      query.industry = industry;
    }

    // Filter by location (city)
    if (location) {
      query["location.city"] = { $regex: location as string, $options: "i" };
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const companies = await Company.find(query)
      .sort(sort as string)
      .skip(skip)
      .limit(limitNum);

    const total = await Company.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        companies,
        pagination: {
          count: companies.length,
          total,
          totalPages: Math.ceil(total / limitNum),
          currentPage: pageNum,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching companies",
      error: error.message,
    });
  }
};

export const getCompany = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const company = await Company.findById(req.params.id).populate(
      "owner",
      "firstName lastName email",
    );

    if (!company) {
      throw new ApiError(404, "Company not found");
    }

    const totalJobs = await Job.countDocuments({ company: company._id });
    const activeJobs = await Job.countDocuments({ 
      company: company._id, 
      status: JobStatus.ACTIVE 
    });
    const totalMembers = await CompanyMember.countDocuments({
      company: company._id,
      isActive: true,
    });
    const currentSubscription = await Subscription.findOne({
      companyId: company._id,
      status: "active"
    }).populate("planId");

    const companyData = {
      ...company.toObject(),
      totalJobs,
      activeJobs,
      totalMembers,
      currentPlan: currentSubscription ? currentSubscription.planId : null,
      subscription: currentSubscription
    };

    res
      .status(200)
      .json(new ApiResponse(200, companyData, "Company fetched successfully"));
  } catch (error: any) {
    next(error);
  }
};

export const getMyCompany = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const isEmployee = req.user.isEmployee;

    if(!isEmployee) {
      return next(new ApiError(403, "You are not authorized to perform this action"));
    }

    const role = req.user.companyRole;

    if(role !== CompanyRole.OWNER && role !== CompanyRole.HR) {
      return next(new ApiError(403, "You are not authorized to perform this action"));
    }

    let company;

    if(role === CompanyRole.OWNER) {
       company = await Company.findOne({ owner: req.user.id }).populate(
        "owner",
        "firstName lastName email",
      );
    } else {
      company = await Company.findById(req.user.companyId).populate(
        "owner",
        "firstName lastName email",
      );
    }

    if (!company) {
      throw new ApiError(404, "You have not created a company yet");
    }

    const totalJobs = await Job.countDocuments({ company: company._id });
    const activeJobs = await Job.countDocuments({ 
      company: company._id, 
      status: JobStatus.ACTIVE 
    });
    const totalMembers = await CompanyMember.countDocuments({
      company: company._id,
      isActive: true,
    });
    const currentSubscription = await Subscription.findOne({
      companyId: company._id,
      status: "active"
    }).populate("planId", "name");
    const kyc = await KYC.findOne({ user: req.user.id });

    const companyData = {
      ...company.toObject(),
      totalJobs,
      activeJobs,
      totalMembers,
      currentPlan: currentSubscription ? currentSubscription.planId : null,
      subscription: currentSubscription,
      kycStatus: kyc ? kyc.status : null,
      kycRejectionReason: kyc?.rejectionReason || null,
    };

    res
      .status(200)
      .json(new ApiResponse(200, companyData, "Company fetched successfully"));
  } catch (error: any) {
    next(error);
  }
};

export const updateCompany = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    let company = await Company.findOne({ owner: req.user.id });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const companyMember = await CompanyMember.findOne({
      user: req.user.id,
    });

    if (!companyMember) {
      return res.status(404).json({
        success: false,
        message: `${req.user.firstName} ${req.user.lastName} is not a memeber of the company ${company.name}`,
      });
    }

    // Make sure user is company owner
    if (
      company.owner.toString() !== req.user.id &&
      companyMember.role !== CompanyRole.OWNER
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this company",
      });
    }

    // Use company._id instead of req.params.id since this is the /me route
    company = await Company.findByIdAndUpdate(company._id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error updating company",
      error: error.message,
    });
  }
};

export const deleteCompany = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const companyMember = await CompanyMember.findOne({
      user: req.user.id,
    });

    if (!companyMember) {
      return res.status(404).json({
        success: false,
        message: `${req.user.firstName} ${req.user.lastName} is not a memeber of the company ${company.name}`,
      });
    }

    // Make sure user is company owner
    if (
      company.owner.toString() !== req.user.id &&
      companyMember.role !== CompanyRole.OWNER
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this company",
      });
    }

    await company.deleteOne();

    // Remove company from user
    await User.findByIdAndUpdate(req.user.id, {
      $unset: { company: 1 },
    });

    res.status(200).json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error deleting company",
      error: error.message,
    });
  }
};

export const uploadCompanyLogo = async (
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

    let company = await Company.findOne({ owner: req.user.id });

    if (!company) {
      throw new ApiError(404, "Company not found");
    }

    if(company?.logo?.publicId){
      await deleteFromCloudinary(company.logo?.publicId);
    }
    
    const result = await uploadToCloudinary(
      req.file.buffer,
      "job_portal/company_logos",
      "image",
      `logo-${company._id}-${Date.now()}`
    );

    company = await Company.findByIdAndUpdate(
      company._id,
      { logo: {
        url: result.secure_url,
        publicId: result.public_id,
      } },
      { new: true, runValidators: true }
    );

    res.status(200).json(
      new ApiResponse(200, { logoUrl: company?.logo }, "Company logo uploaded successfully")
    );
  } catch (error: any) {
    next(error);
  }
};
