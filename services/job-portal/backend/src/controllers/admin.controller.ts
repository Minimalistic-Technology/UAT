import { NextFunction, Request, Response } from "express";
import User, { GlobalRole, IUser } from "../models/User.model.js";
import { JobStatus } from "../models/Job.model.js";
import Job from "../models/Job.model.js";
import CompanyMember from "../models/CompanyMember.model.js";
import Company from "../models/Company.model.js";
import { Types } from "mongoose";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

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

export const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      throw new ApiError(404, "User not found.");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedUser,
          `User account has been ${isActive ? "activated" : "deactivated"} successfully.`,
        ),
      );
  } catch (error: any) {
    next(error);
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
      message: "Failed to fetch platform statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getKycApplications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
    next(error);
  }
};

export const updateKycStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { applicationId } = req.params;
  const { status } = req.body;

  try {
    if (!["approved", "rejected"].includes(status)) {
      throw new ApiError(
        400,
        "Invalid status provided. Must be 'approved' or 'rejected'.",
      );
    }

    const KYC = (await import("../models/KYC.model.js")).default;

    const kycApplication = await KYC.findById(applicationId);

    if (!kycApplication) {
      throw new ApiError(404, "KYC application not found.");
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
        company: company._id,
      });
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          kycApplication,
          `KYC application has been successfully ${status}.`,
        ),
      );
  } catch (error: any) {
    next(error);
  }
};

export const getAdminAnalytics = async (req: Request, res: Response) => {
  try {
    const KYC = (await import("../models/KYC.model.js")).default;
    const Payment = (await import("../models/Payment.model.js")).default;
    const { PaymentStatus } = await import("../models/Payment.model.js");
    const Application = (await import("../models/Application.model.js")).default;

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      currentMonthPayments, 
      lastMonthPayments, 
      totalRevenueAggr,
      activeUsers,
      jobListings,
      kycPending,
      totalCompanies,
      totalApplications
    ] = await Promise.all([
      Payment.aggregate([
        { $match: { status: PaymentStatus.CAPTURED, createdAt: { $gte: currentMonthStart } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Payment.aggregate([
        { $match: { status: PaymentStatus.CAPTURED, createdAt: { $gte: lastMonthStart, $lt: currentMonthStart } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Payment.aggregate([
        { $match: { status: PaymentStatus.CAPTURED } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      User.countDocuments({ isActive: true, role: GlobalRole.USER }),
      Job.countDocuments({ status: JobStatus.ACTIVE }),
      KYC.countDocuments({ status: "pending" }),
      Company.countDocuments({}),
      Application.countDocuments({})
    ]);

    const currentRevenue = (currentMonthPayments[0]?.total || 0) / 100;
    const lastRevenue = (lastMonthPayments[0]?.total || 0) / 100;
    const totalRevenue = (totalRevenueAggr[0]?.total || 0) / 100;

    let revenueGrowth = 0;
    if (lastRevenue > 0) {
      revenueGrowth = ((currentRevenue - lastRevenue) / lastRevenue) * 100;
    } else if (currentRevenue > 0) {
      revenueGrowth = 100;
    }

    // Graph Data for the last 6 months
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [revenueGraphData, usersGraphData, jobsGraphData] = await Promise.all([
      Payment.aggregate([
        { $match: { status: PaymentStatus.CAPTURED, createdAt: { $gte: sixMonthsAgo } } },
        { 
          $group: {
            _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
            total: { $sum: "$amount" }
          }
        }
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo }, role: GlobalRole.USER } },
        { 
          $group: {
            _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
            count: { $sum: 1 }
          }
        }
      ]),
      Job.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        { 
          $group: {
            _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const formatGraphData = (data: any[], valueKey: string) => {
      const formatted = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        const found = data.find((item: any) => item._id.month === month && item._id.year === year);
        formatted.push({
          name: d.toLocaleString('default', { month: 'short' }),
          [valueKey]: found ? (valueKey === 'revenue' ? found.total / 100 : found.count) : 0
        });
      }
      return formatted;
    };

    const revenueChart = formatGraphData(revenueGraphData, "revenue");
    const usersChart = formatGraphData(usersGraphData, "users");
    const jobsChart = formatGraphData(jobsGraphData, "jobs");

    return res.status(200).json({
      success: true,
      message: "Admin analytics fetched successfully",
      data: {
        summary: {
          totalRevenue,
          revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
          activeUsers,
          jobListings,
          kycPending,
          totalCompanies,
          totalApplications
        },
        graphs: {
          revenue: revenueChart,
          users: usersChart,
          jobs: jobsChart
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin analytics",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
