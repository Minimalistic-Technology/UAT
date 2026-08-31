import type { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ALLOWED_MIME_TYPES_FOR_AVATAR } from "../constants/index.js";
import bcrypt from "bcryptjs";

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

  try {
    const result = await prisma.$transaction(async (tx) => {
      let owner = await tx.user.findUnique({ where: { email } });

      if (!owner) {
        const hashedPassword = await bcrypt.hash(password, 12);
        owner = await tx.user.create({
          data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            role: "USER",
          },
        });
      }

      const existingOwnership = await tx.company.findUnique({
        where: { ownerId: owner.id },
      });

      if (existingOwnership) {
        throw new ApiError(400, "This user is already an owner of an existing company.");
      }

      const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

      const newCompany = await tx.company.create({
        data: {
          name: companyName,
          slug,
          ownerId: owner.id,
          description: companyDescription,
          industry,
        },
      });

      await tx.companyMember.create({
        data: {
          userId: owner.id,
          companyId: newCompany.id,
          role: "OWNER",
          isActive: true,
        },
      });

      return { owner, newCompany };
    });

    return res.status(201).json({
      success: true,
      message: "Company and Owner account set up successfully",
      data: {
        company: result.newCompany,
        owner: {
          id: result.owner.id,
          email: result.owner.email,
          fullName: `${result.owner.firstName} ${result.owner.lastName}`,
        },
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error creating company",
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

    if (search) {
      query.name = { contains: search as string, mode: "insensitive" };
    }
    if (industry) {
      query.industry = industry;
    }
    if (location) {
      query.locations = { some: { city: { contains: location as string, mode: "insensitive" } } };
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sortField = (sort as string).startsWith("-") ? (sort as string).substring(1) : sort;
    const sortOrder = (sort as string).startsWith("-") ? "desc" : "asc";

    const companies = await prisma.company.findMany({
      where: query,
      include: {
        locations: true,
        logo: true,
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { [sortField as string]: sortOrder },
      skip,
      take: limitNum,
    });

    const total = await prisma.company.count({ where: query });

    const formattedCompanies = companies.map((c) => ({
      _id: c.id,
      ...c,
    }));

    res.status(200).json({
      success: true,
      data: {
        companies: formattedCompanies,
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
    const company = await prisma.company.findUnique({
      where: { id: String(req.params.id) },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        locations: true,
        logo: true,
        members: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!company) {
      throw new ApiError(404, "Company not found");
    }

    const [
      totalJobs,
      activeJobs,
      totalInternships,
      activeInternships,
      totalMembers,
      currentSubscription,
    ] = await Promise.all([
      prisma.baseListing.count({
        where: { companyId: company.id, opportunityType: "JOB", isDeleted: false },
      }),
      prisma.baseListing.count({
        where: { companyId: company.id, opportunityType: "JOB", status: "ACTIVE", isDeleted: false },
      }),
      prisma.baseListing.count({
        where: { companyId: company.id, opportunityType: "INTERNSHIP", isDeleted: false },
      }),
      prisma.baseListing.count({
        where: { companyId: company.id, opportunityType: "INTERNSHIP", status: "ACTIVE", isDeleted: false },
      }),
      prisma.companyMember.count({
        where: { companyId: company.id, isActive: true },
      }),
      prisma.subscription.findFirst({
        where: { companyId: company.id, status: "ACTIVE" },
        include: { plan: true },
      }),
    ]);

    const companyData = {
      _id: company.id,
      ...company,
      totalJobs,
      activeJobs,
      totalInternships,
      activeInternships,
      totalListings: totalJobs + totalInternships,
      activeListings: activeJobs + activeInternships,
      totalMembers,
      currentPlan: currentSubscription ? currentSubscription.plan : null,
      subscription: currentSubscription,
      remainingJobPosts: currentSubscription
        ? currentSubscription.postsRemaining
        : null,
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
    const companyMember = await prisma.companyMember.findFirst({
      where: { userId: req.user?.id },
    });

    if (!companyMember) {
      return next(new ApiError(400, "Company member not found"));
    }

    const company = await prisma.company.findUnique({
      where: { id: companyMember.companyId },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        logo: true,
        locations: true,
        members: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!company) {
      throw new ApiError(404, "You have not created a company yet");
    }

    const [
      totalJobs,
      activeJobs,
      totalInternships,
      activeInternships,
      totalMembers,
      currentSubscription,
      kyc,
    ] = await Promise.all([
      prisma.baseListing.count({ where: { companyId: company.id, opportunityType: "JOB", isDeleted: false } }),
      prisma.baseListing.count({ where: { companyId: company.id, opportunityType: "JOB", status: "ACTIVE", isDeleted: false } }),
      prisma.baseListing.count({ where: { companyId: company.id, opportunityType: "INTERNSHIP", isDeleted: false } }),
      prisma.baseListing.count({
        where: { companyId: company.id, opportunityType: "INTERNSHIP", status: "ACTIVE", isDeleted: false },
      }),
      prisma.companyMember.count({ where: { companyId: company.id, isActive: true } }),
      prisma.subscription.findFirst({
        where: { companyId: company.id, status: "ACTIVE" },
        include: { plan: { select: { name: true } } },
      }),
      prisma.kYC.findFirst({ where: { userId: req.user?.id }, orderBy: { createdAt: "desc" } }),
    ]);

    const companyData = {
      _id: company.id,
      ...company,
      totalJobs,
      activeJobs,
      totalInternships,
      activeInternships,
      totalListings: totalJobs + totalInternships,
      activeListings: activeJobs + activeInternships,
      totalMembers,
      currentPlan: currentSubscription ? currentSubscription.plan : null,
      subscription: currentSubscription,
      remainingJobPosts: currentSubscription
        ? currentSubscription.postsRemaining
        : null,
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
    const isCompanyOwner = await prisma.companyMember.findFirst({
      where: { userId: req.user?.id, role: "OWNER", isActive: true },
    });

    if (!isCompanyOwner) {
      return next(
        new ApiError(
          403,
          "You are not authorized to update the company profile",
        ),
      );
    }

    const allowedFields = ['name', 'description', 'website', 'industry', 'companySize', 'socialLinks'];
    const updateData: any = {};
    for (const key of Object.keys(req.body)) {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    }

    const company = await prisma.company.update({
      where: { id: isCompanyOwner.companyId },
      data: updateData,
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
    const isCompanyOwner = await prisma.companyMember.findFirst({
      where: { userId: req.user?.id, role: "OWNER", isActive: true },
    });

    if (!isCompanyOwner) {
      return next(
        new ApiError(403, "You are not authorized to delete this company"),
      );
    }

    // Prisma onDelete: Cascade will handle relations (CompanyMember, BaseListing, etc.)
    await prisma.company.delete({
      where: { id: isCompanyOwner.companyId },
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
    const isCompanyOwner = await prisma.companyMember.findFirst({
      where: { userId: req.user?.id, role: "OWNER", isActive: true },
    });

    if (!isCompanyOwner) {
      return next(
        new ApiError(
          403,
          "You are not authorized to update the logo of this company",
        ),
      );
    }

    if (!req.file) {
      throw new ApiError(400, "Please upload a file");
    }

    if (!ALLOWED_MIME_TYPES_FOR_AVATAR.includes(req.file.mimetype)) {
      throw new ApiError(400, "Only images are allowed");
    }

    let company = await prisma.company.findUnique({
      where: { id: isCompanyOwner.companyId },
      include: { logo: true },
    });

    if (!company) {
      throw new ApiError(404, "Company not found");
    }

    if (company.logo?.publicId) {
      await deleteFromCloudinary(company.logo.publicId);
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      "job_portal/company_logos",
      "image",
      `logo-${company.id}-${Date.now()}`,
    );

    const updatedCompany = await prisma.$transaction(async (tx) => {
      const asset = await tx.storageAsset.create({
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          mimeType: req.file!.mimetype,
          sizeBytes: req.file!.size,
        },
      });

      return tx.company.update({
        where: { id: company.id },
        data: { logoId: asset.id },
        include: { logo: true },
      });
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { logoUrl: updatedCompany.logo },
          "Company logo uploaded successfully",
        ),
      );
  } catch (error: any) {
    next(error);
  }
};
