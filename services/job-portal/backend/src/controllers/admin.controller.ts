import { NextFunction, Request, Response } from "express";
import User, { GlobalRole, IUser } from "../models/User.model.js";
import { JobStatus } from "../models/BaseJob.model.js";
import { Types } from "mongoose";

// Utils
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { getPagination } from "../utils/parse-pagination.js";

// Models
import KYC from "../models/KYC.model.js";
import Payment, { PaymentStatus } from "../models/Payment.model.js";
import Application from "../models/Application.model.js"
import Internship from "../models/Internship.model.js";
import Job from "../models/Job.model.js";
import CompanyMember from "../models/CompanyMember.model.js";
import Company from "../models/Company.model.js";
import Coupon from "../models/Coupon.model.js";

type IUserWithCompany = IUser & {
  isEmployee?: boolean;
  companyId?: Types.ObjectId | null;
  companyRole?: string | null;
  companyName?: string | null;
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit } = getPagination(req.query);
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
    })
      .populate({ path: "company", select: "name" })
      .lean();

    // Create lookup map: userId -> membership
    const membershipMap = new Map(
      memberships.map((m) => [m.user.toString(), m]),
    );

    // Attach fields to users
    const enhancedUsers = users.map((user) => {
      if (user.role === GlobalRole.USER) {
        const membership = membershipMap.get(user._id.toString());

        user.isEmployee = !!membership;
        user.companyId = membership?.company?._id ?? null;
        user.companyRole = membership?.role ?? null;
        // @ts-ignore
        user.companyName = membership?.company?.name ?? null;
      }

      return user;
    });

    if (!users) {
      throw new ApiError(400, "Failed to fetch users");
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
    next(error);
  }
};

export const getListingsByStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const status = req.query.status;
    const jobStatus = status ?? JobStatus.PENDING;

    const { page: currentPage, limit: pageSize } = getPagination(req.query);
    const skip = (currentPage - 1) * pageSize;

    const query = { status: jobStatus };

    const [totalJobs, totalInternships] = await Promise.all([
      Job.countDocuments(query),
      Internship.countDocuments(query),
    ]);

    const totalCombined = totalJobs + totalInternships;
    const totalPages = Math.ceil(totalCombined / pageSize);

    const [jobs, internships] = await Promise.all([
      Job.find(query)
        .populate("company", "name logo")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Internship.find(query)
        .populate("company", "name logo")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
    ]);

    const taggedJobs = jobs.map((job) => ({ ...job, opportunityType: "job" }));
    const taggedInternships = internships.map((internship) => ({
      ...internship,
      opportunityType: "internship",
    }));

    const merged = [...taggedJobs, ...taggedInternships]
      .sort(
        (a, b) =>
          // @ts-ignore
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, pageSize);

    return res.status(200).json({
      success: true,
      message: `Listings with status '${jobStatus}' fetched successfully`,
      data: {
        count: totalCombined,
        listings: merged,
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
    next(error);
  }
};

export const toggleUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    user.isActive = !user.isActive;
    await user.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          user,
          `User account has been ${user.isActive ? "activated" : "deactivated"} successfully.`,
        ),
      );
  } catch (error: any) {
    next(error);
  }
};

export const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
    next(error);
  }
};

export const getKycApplications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit } = getPagination(req.query);
    const status = req.query.status;

    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const [applications, totalApplications] = await Promise.all([
      KYC.find(filter)
        .populate("user", "firstName lastName email")
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
  const { status, note } = req.body;

  try {
    const KYC = (await import("../models/KYC.model.js")).default;

    const kycApplication = await KYC.findById(applicationId);

    if (!kycApplication) {
      throw new ApiError(404, "KYC application not found.");
    }

    kycApplication.status = status;
    if (status === "rejected" && note) {
      kycApplication.rejectionReason = note;
      // Also delete the assets attached to this kycApplication
      if (kycApplication.companyDocument?.publicId) {
        await deleteFromCloudinary(kycApplication.companyDocument.publicId);
      }
      if (kycApplication.personalDocument?.publicId) {
        await deleteFromCloudinary(kycApplication.personalDocument.publicId);
      }
    }
    await kycApplication.save();

    if (status === "approved") {
      const companyMember = await CompanyMember.findOne({ user: kycApplication.user });

      if (companyMember) {
        let company = await Company.findById(companyMember.company);
        if (company) {
          company.isVerified = true;
          await company.save();

          // Elevate system user privileges & metadata bindings globally
          await User.findByIdAndUpdate(kycApplication.user, {
            isVerified: true,
            company: company._id,
          });
        }
      }
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

export const getAdminAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // --- Exchange rates to INR (update these or fetch from a live API) ---
    const toINR: Record<string, number> = {
      INR: 1,
      USD: 83.5,
      EUR: 90.2,
      GBP: 105.8,
    };

    // Helper: converts a currency-grouped aggregation result → INR total
    const toINRTotal = (aggr: { _id: string; total: number }[]) =>
      aggr.reduce((sum, { _id: currency, total }) => {
        const rate = toINR[currency?.toUpperCase()] ?? 1;
        return sum + (total / 100) * rate;
      }, 0);

    // Shared aggregation pipeline factory — groups by currency
    const revenuePipeline = (matchExtra: Record<string, unknown>) => [
      { $match: { status: PaymentStatus.CAPTURED, ...matchExtra } },
      { $group: { _id: "$currency", total: { $sum: "$amount" } } },
    ];

    const [
      currentMonthPayments,
      lastMonthPayments,
      totalRevenueAggr,
      activeUsers,
      jobListings,
      internshipListings,
      kycPending,
      totalCompanies,
      totalApplications,
      recentEmployersAggr,
      topCouponsData
    ] = await Promise.all([
      Payment.aggregate(revenuePipeline({ createdAt: { $gte: currentMonthStart } })),
      Payment.aggregate(revenuePipeline({ createdAt: { $gte: lastMonthStart, $lt: currentMonthStart } })),
      Payment.aggregate(revenuePipeline({})),
      User.countDocuments({ isActive: true, role: GlobalRole.USER }),
      Job.countDocuments({ status: JobStatus.ACTIVE }),
      Internship.countDocuments({ status: JobStatus.ACTIVE }),
      KYC.countDocuments({ status: "pending" }),
      Company.countDocuments({}),
      Application.countDocuments({}),
      Company.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        { $lookup: { from: "kycs", localField: "owner", foreignField: "user", as: "kyc" } },
        { $unwind: { path: "$kyc", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            name: 1,
            createdAt: 1,
            isVerified: 1,
            kycStatus: { $ifNull: ["$kyc.status", "pending"] },
          }
        }
      ]),
      Coupon.find({ usageCount: { $gt: 0 } }).sort({ usageCount: -1 }).limit(3).lean()
    ]);

    const currentRevenue = toINRTotal(currentMonthPayments);
    const lastRevenue = toINRTotal(lastMonthPayments);
    const totalRevenue = toINRTotal(totalRevenueAggr);

    let revenueGrowth = 0;
    if (lastRevenue > 0) {
      revenueGrowth = ((currentRevenue - lastRevenue) / lastRevenue) * 100;
    } else if (currentRevenue > 0) {
      revenueGrowth = 100;
    }

    // --- Graph data (last 6 months) ---
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [revenueGraphData, usersGraphData, jobsGraphData, internshipsGraphData] = await Promise.all([
      Payment.aggregate([
        { $match: { status: PaymentStatus.CAPTURED, createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
              currency: "$currency",
            },
            total: { $sum: "$amount" },
          },
        },
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo }, role: GlobalRole.USER } },
        {
          $group: {
            _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
      ]),
      Job.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
      ]),
      Internship.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);


    const formatRevenueChart = () => {
      const formatted = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = d.getMonth() + 1;
        const year = d.getFullYear();

        // Sum all currency buckets for this month → INR
        const monthEntries = revenueGraphData.filter(
          (item: any) => item._id.month === month && item._id.year === year,
        );
        const revenueINR = monthEntries.reduce((sum: number, item: any) => {
          const rate = toINR[item._id.currency?.toUpperCase()] ?? 1;
          return sum + (item.total / 100) * rate;
        }, 0);

        formatted.push({
          name: d.toLocaleString("default", { month: "short" }),
          revenue: parseFloat(revenueINR.toFixed(2)),
        });
      }
      return formatted;
    };

    const formatCountChart = (data: any[], valueKey: string) => {
      const formatted = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        const found = data.find(
          (item: any) => item._id.month === month && item._id.year === year,
        );
        formatted.push({
          name: d.toLocaleString("default", { month: "short" }),
          [valueKey]: found?.count ?? 0,
        });
      }
      return formatted;
    };

    return res.status(200).json({
      success: true,
      message: "Admin analytics fetched successfully",
      data: {
        summary: {
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),   // always INR ₹
          revenueCurrency: "INR",
          revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
          activeUsers,
          jobListings,
          internshipListings,
          kycPending,
          totalCompanies,
          totalApplications,
        },
        graphs: {
          revenue: formatRevenueChart(), // ₹ INR values
          users: formatCountChart(usersGraphData, "users"),
          jobs: formatCountChart(jobsGraphData, "jobs"),
          internships: formatCountChart(internshipsGraphData, "internships"),
        },
        recentEmployers: recentEmployersAggr,
        topCoupons: topCouponsData,
      },
    });
  } catch (error) {
    next(error);
  }
};
