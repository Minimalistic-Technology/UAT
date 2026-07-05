import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { getPagination } from "../utils/parse-pagination.js";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit } = getPagination(req.query);
    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where: { role: { not: "SUPER_ADMIN" } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          avatar: true,
          companyMembers: {
            include: { company: { select: { name: true } } }
          }
        }
      }),
      prisma.user.count({ where: { role: { not: "SUPER_ADMIN" } } })
    ]);

    const enhancedUsers = users.map((user) => {
      let isEmployee = false;
      let companyRole = null;
      let companyName = null;

      if (user.role === "USER" && user.companyMembers.length > 0) {
        isEmployee = true;
        companyRole = user.companyMembers[0].role;
        companyName = user.companyMembers[0].company.name;
      }

      const { companyMembers, ...rest } = user;
      return {
        ...rest,
        _id: user.id, // For backwards compatibility
        isEmployee,
        companyRole,
        companyName
      };
    });

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
    const status = (req.query.status as string)?.toUpperCase() || "PENDING";
    const { page: currentPage, limit: pageSize } = getPagination(req.query);
    const skip = (currentPage - 1) * pageSize;

    const [listings, totalCombined] = await Promise.all([
      prisma.baseListing.findMany({
        where: { status: status as any },
        include: { company: { select: { name: true, logo: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize
      }),
      prisma.baseListing.count({ where: { status: status as any } })
    ]);

    const totalPages = Math.ceil(totalCombined / pageSize);

    const merged = listings.map(listing => ({
       ...listing,
       _id: listing.id,
       opportunityType: listing.opportunityType.toLowerCase()
    }));

    return res.status(200).json({
      success: true,
      message: `Listings with status '${status}' fetched successfully`,
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
  const userId = req.params.userId as string;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive }
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedUser,
          `User account has been ${updatedUser.isActive ? "activated" : "deactivated"} successfully.`,
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
      prisma.user.count(),
      prisma.baseListing.count({ where: { opportunityType: "JOB" } }),
      prisma.company.count(),
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
    const status = (req.query.status as string)?.toUpperCase();

    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const [applications, totalApplications] = await Promise.all([
      prisma.kYC.findMany({
        where: filter,
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.kYC.count({ where: filter })
    ]);

    const formattedApplications = applications.map(app => ({
      ...app,
      _id: app.id,
      user: {
        ...app.user,
        _id: app.user.id
      }
    }));

    const totalPages = Math.ceil(totalApplications / limit);

    return res.status(200).json({
      success: true,
      message: "KYC applications fetched successfully",
      data: {
        count: totalApplications,
        applications: formattedApplications,
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
  const applicationId = req.params.applicationId as string;
  const { status, note } = req.body;

  try {
    const kycStatus = status.toUpperCase();
    const kycApplication = await prisma.kYC.findUnique({ 
      where: { id: applicationId },
      include: { companyDocument: true, personalDocument: true }
    });

    if (!kycApplication) {
      throw new ApiError(404, "KYC application not found.");
    }

    if (kycStatus === "REJECTED" && note) {
      if (kycApplication.companyDocument?.publicId) {
        await deleteFromCloudinary(kycApplication.companyDocument.publicId);
      }
      if (kycApplication.personalDocument?.publicId) {
        await deleteFromCloudinary(kycApplication.personalDocument.publicId);
      }
    }

    const updatedKyc = await prisma.kYC.update({
      where: { id: applicationId },
      data: {
        status: kycStatus,
        rejectionReason: kycStatus === "REJECTED" ? note : null,
      }
    });

    if (kycStatus === "APPROVED") {
      const companyMember = await prisma.companyMember.findFirst({ where: { userId: kycApplication.userId } });

      if (companyMember) {
        await prisma.company.update({
          where: { id: companyMember.companyId },
          data: { isVerified: true, verifiedAt: new Date() }
        });

        await prisma.user.update({
          where: { id: kycApplication.userId },
          data: { isVerified: true }
        });
      }
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedKyc,
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
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // --- Exchange rates to INR ---
    const toINR: Record<string, number> = {
      INR: 1,
      USD: 83.5,
      EUR: 90.2,
      GBP: 105.8,
    };

    // Helper: converts list of payments → INR total
    const toINRTotal = (payments: { currency: string; amount: number }[]) =>
      payments.reduce((sum, p) => {
        const rate = toINR[p.currency?.toUpperCase()] ?? 1;
        return sum + (p.amount / 100) * rate; // amount is in cents/paise
      }, 0);

    const [
      allPayments,
      activeUsers,
      jobListings,
      internshipListings,
      kycPending,
      totalCompanies,
      totalApplications,
      recentCompanies,
      topCouponsData,
      usersLast6Months,
      jobsLast6Months,
      internshipsLast6Months,
    ] = await Promise.all([
      prisma.payment.findMany({
        where: { status: "CAPTURED" },
        select: { amount: true, currency: true, createdAt: true }
      }),
      prisma.user.count({ where: { isActive: true, role: "USER" } }),
      prisma.baseListing.count({ where: { status: "ACTIVE", opportunityType: "JOB" } }),
      prisma.baseListing.count({ where: { status: "ACTIVE", opportunityType: "INTERNSHIP" } }),
      prisma.kYC.count({ where: { status: "PENDING" } }),
      prisma.company.count(),
      prisma.application.count(),
      prisma.company.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          owner: {
            select: { 
              kycSubmissions: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true } } 
            }
          }
        }
      }),
      prisma.coupon.findMany({
        where: { usageCount: { gt: 0 } },
        orderBy: { usageCount: "desc" },
        take: 3
      }),
      prisma.user.findMany({
        where: { role: "USER", createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true }
      }),
      prisma.baseListing.findMany({
        where: { opportunityType: "JOB", createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true }
      }),
      prisma.baseListing.findMany({
        where: { opportunityType: "INTERNSHIP", createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true }
      })
    ]);

    const currentMonthPayments = allPayments.filter(p => p.createdAt >= currentMonthStart);
    const lastMonthPayments = allPayments.filter(p => p.createdAt >= lastMonthStart && p.createdAt < currentMonthStart);
    
    const currentRevenue = toINRTotal(currentMonthPayments);
    const lastRevenue = toINRTotal(lastMonthPayments);
    const totalRevenue = toINRTotal(allPayments);

    let revenueGrowth = 0;
    if (lastRevenue > 0) {
      revenueGrowth = ((currentRevenue - lastRevenue) / lastRevenue) * 100;
    } else if (currentRevenue > 0) {
      revenueGrowth = 100;
    }

    const recentEmployersAggr = recentCompanies.map(c => ({
      name: c.name,
      createdAt: c.createdAt,
      isVerified: c.isVerified,
      kycStatus: c.owner?.kycSubmissions[0]?.status.toLowerCase() || "PENDING"
    }));

    // --- Graph data (last 6 months) ---
    const formatRevenueChart = () => {
      const formatted = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = d.getMonth() + 1;
        const year = d.getFullYear();

        const monthEntries = allPayments.filter(
          (p) => p.createdAt.getMonth() + 1 === month && p.createdAt.getFullYear() === year && p.createdAt >= sixMonthsAgo,
        );
        const revenueINR = toINRTotal(monthEntries);

        formatted.push({
          name: d.toLocaleString("default", { month: "short" }),
          revenue: parseFloat(revenueINR.toFixed(2)),
        });
      }
      return formatted;
    };

    const formatCountChart = (data: { createdAt: Date }[], valueKey: string) => {
      const formatted = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        
        const count = data.filter(
          (item) => item.createdAt.getMonth() + 1 === month && item.createdAt.getFullYear() === year
        ).length;
        
        formatted.push({
          name: d.toLocaleString("default", { month: "short" }),
          [valueKey]: count,
        });
      }
      return formatted;
    };

    return res.status(200).json({
      success: true,
      message: "Admin analytics fetched successfully",
      data: {
        summary: {
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
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
          revenue: formatRevenueChart(),
          users: formatCountChart(usersLast6Months, "users"),
          jobs: formatCountChart(jobsLast6Months, "jobs"),
          internships: formatCountChart(internshipsLast6Months, "internships"),
        },
        recentEmployers: recentEmployersAggr,
        topCoupons: topCouponsData,
      },
    });
  } catch (error) {
    next(error);
  }
};
