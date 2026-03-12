import { Request, Response } from "express";
import User, { GlobalRole, IUser } from "../models/User.model.js";
import { JobStatus } from "../models/Job.model.js";
import Job from "../models/Job.model.js";
import CompanyMember from "../models/CompanyMember.model.js";
import Company from "../models/Company.model.js";
import { Types } from "mongoose";

type IUserWithCompany = IUser & {
  isEmployee?: boolean;
  companyId?: Types.ObjectId | null;
  companyRole?: string | null;
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);

    const skip = (page - 1) * limit;

    const filter = { role: { $ne: GlobalRole.SUPER_ADMIN } };

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select("-password -__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<IUserWithCompany[]>(),
      User.countDocuments(filter),
    ]);

    // Get all USER ids only
    const userIds = users
      .filter((u) => u.role === GlobalRole.USER)
      .map((u) => u._id);

    // Fetch memberships in ONE query
    const memberships = await CompanyMember.find({
      user: { $in: userIds },
    }).lean();

    // Create lookup map: userId -> membership
    const membershipMap = new Map(
      memberships.map((m) => [m.user.toString(), m]),
    );

    // Attach fields to users
    const enhancedUsers = users.map((user) => {
      if (user.role === GlobalRole.USER) {
        const membership = membershipMap.get(user._id.toString());

        user.isEmployee = !!membership;
        user.companyId = membership?.company ?? null;
        user.companyRole = membership?.role ?? null;
      }

      return user;
    });

    if (!users) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to fetch users" });
    }

    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(200).json({
      success: true,
      message: "users fetched successfully",
      data: {
        count: totalUsers,
        users: enhancedUsers,
        pagination: {
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getJobsByStatus = async (req: Request, res: Response) => {
  try {
    let { status, page, limit } = req.query;

    const jobStatus = (status as string) || JobStatus.PENDING;

    const currentPage = Math.max(1, parseInt(page as string) || 1);
    const pageSize = Math.max(1, parseInt(limit as string) || 10);
    const skip = (currentPage - 1) * pageSize;

    const [jobs, totalJobs] = await Promise.all([
      Job.find({ status: jobStatus })
        .populate("company", "name logo") // Example population
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Job.countDocuments({ status: jobStatus }),
    ]);

    const totalPages = Math.ceil(totalJobs / pageSize);

    return res.status(200).json({
      success: true,
      message: `Jobs with status '${jobStatus}' fetched successfully`,
      data: {
        count: totalJobs,
        jobs,
        pagination: {
          totalPages,
          currentPage,
          limit: pageSize,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching jobs",
      error: error.message,
    });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `User account has been ${isActive ? "activated" : "deactivated"} successfully.`,
      data: updatedUser,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching jobs",
      error: error.message,
    });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalJobs, totalCompanies] = await Promise.all([
      User.countDocuments({}),
      Job.countDocuments({}),
      Company.countDocuments({}),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalJobs,
        totalCompanies,
      },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch platform statistics', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const getKycApplications = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const status = req.query.status as string;

    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    // Dynamic import to avoid circular dependency if Model architecture changed,
    // assuming KYC is exported from User.model.ts or from its own KYC.model.ts file.
    // For safety, checking whether KYC model is injected or available.
    // I know that KYC model was created in src/models/KYC.model.ts earlier. 
    const KYC = (await import("../models/KYC.model.js")).default;

    const [applications, totalApplications] = await Promise.all([
      KYC.find(filter)
        .populate("user", "firstName lastName email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      KYC.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalApplications / limit);

    return res.status(200).json({
      success: true,
      message: "KYC applications fetched successfully",
      data: {
        count: totalApplications,
        applications,
        pagination: {
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch KYC applications",
      error: error.message,
    });
  }
};

export const updateKycStatus = async (req: Request, res: Response) => {
  const { applicationId } = req.params;
  const { status } = req.body;

  try {
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status provided. Must be 'approved' or 'rejected'.",
      });
    }

    const KYC = (await import("../models/KYC.model.js")).default;

    const kycApplication = await KYC.findById(applicationId);

    if (!kycApplication) {
      return res.status(404).json({
        success: false,
        message: "KYC application not found.",
      });
    }

    kycApplication.status = status;
    await kycApplication.save();

    if (status === "approved") {
      let company = await Company.findOne({ owner: kycApplication.user });

      if (!company) {
        // Create an introductory company footprint using the given KYC properties
        company = await Company.create({
          name: kycApplication.companyName,
          description: "Company details pending.", 
          industry: "Not specified",
          owner: kycApplication.user,
          isVerified: true,
        });

        // Instantiate the applicant as the designated company owner
        await CompanyMember.create({
          user: kycApplication.user,
          company: company._id,
          role: "owner",
        });
      } else {
        // Upgrade existing un-verified corporate entities with fresh KYC metadata
        company.isVerified = true;
        company.name = kycApplication.companyName;
        await company.save();
      }

      // Elevate system user privileges & metadata bindings globally
      await User.findByIdAndUpdate(kycApplication.user, { 
        isVerified: true,
        company: company._id
      });
    }

    return res.status(200).json({
      success: true,
      message: `KYC application has been successfully ${status}.`,
      data: kycApplication,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to update KYC application status.",
      error: error.message,
    });
  }
};