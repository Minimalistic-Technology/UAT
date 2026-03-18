import type { Response, NextFunction } from "express";
import Company from "../models/Company.model.js";
import User, { GlobalRole } from "../models/User.model.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import CompanyMember, { CompanyRole } from "../models/CompanyMember.model.js";
import mongoose from "mongoose";

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

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Public
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
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching company",
      error: error.message,
    });
  }
};

// @desc    Get current user's company
// @route   GET /api/companies/me
// @access  Private (Employer)
export const getMyCompany = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const company = await Company.findOne({ owner: req.user.id });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "You have not created a company yet",
      });
    }

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching your company",
      error: error.message,
    });
  }
};

// @desc    Update company
// @route   PUT /api/companies/me
// @access  Private (Employer - Owner only)
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

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private (Employer - Owner only)
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
