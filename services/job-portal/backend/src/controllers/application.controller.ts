import type { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { ApplicationStatus, DraftType, JobStatus, CompanyRole } from "../../generated/prisma/client.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

export const createApplication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { listingId, listingType } = req.body; // listingType is "JOB" | "INTERNSHIP"

    // Find the user with their resume
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { resume: true }
    });

    if (!user?.resume) {
      throw new ApiError(
        400,
        "Resume is required to apply for this job. Please upload your resume in your profile.",
      );
    }

    const listing = await prisma.baseListing.findUnique({
      where: { id: listingId }
    });

    if (!listing || listing.opportunityType !== listingType) {
      throw new ApiError(404, `${listingType} not found`);
    }

    if (listing.status === ("CLOSED" as JobStatus)) {
      throw new ApiError(
        400,
        `This ${listingType} is no longer accepting applications`,
      );
    }

    const existingApplication = await prisma.application.findFirst({
      where: {
        listingId,
        listingType: listingType as DraftType,
        jobSeekerId: req.user.id,
      }
    });

    if (existingApplication) {
      throw new ApiError(
        400,
        `You have already applied for this ${listingType}`,
      );
    }

    const application = await prisma.application.create({
      data: {
        listingId,
        listingType: listingType as DraftType,
        jobSeekerId: req.user.id,
        resumeId: user.resume.id,
      }
    });

    await prisma.baseListing.update({
      where: { id: listingId },
      data: { applicationsCount: { increment: 1 } }
    });

    res
      .status(201)
      .json(
        new ApiResponse(201, application, "Application submitted successfully"),
      );
  } catch (error: any) {
    next(error);
  }
};

export const getMyApplications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [applications, totalApplications] = await Promise.all([
      prisma.application.findMany({
        where: { jobSeekerId: req.user.id },
        include: {
          listing: {
            select: {
              title: true,
              company: { select: { name: true } },
              workMode: true,
              opportunityType: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.application.count({ where: { jobSeekerId: req.user.id } })
    ]);

    const totalPages = Math.ceil(totalApplications / limit);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          applications,
          pagination: {
            totalItems: totalApplications,
            totalPages,
            currentPage: page,
            limit,
          },
        },
        "Applications fetched successfully",
      ),
    );
  } catch (error: any) {
    next(error);
  }
};

export const getMyApplicationStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stats = await prisma.application.groupBy({
      by: ['status', 'listingType'],
      where: { jobSeekerId: req.user.id },
      _count: { _all: true },
    });

    const formattedStats = {
      total: 0,
      byStatus: Object.values(ApplicationStatus).reduce(
        (acc, status) => ({ ...acc, [status]: 0 }),
        {} as Record<ApplicationStatus, number>,
      ),
      byListingType: {
        [DraftType.JOB]: 0,
        [DraftType.INTERNSHIP]: 0,
      },
    };

    stats.forEach(({ status, listingType, _count }) => {
      formattedStats.total += _count._all;
      formattedStats.byStatus[status as ApplicationStatus] += _count._all;
      formattedStats.byListingType[listingType as DraftType] += _count._all;
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          formattedStats,
          "Application stats fetched successfully",
        ),
      );
  } catch (error: any) {
    next(error);
  }
};

export const getAllCompanyApplications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const companyMember = await prisma.companyMember.findFirst({
      where: { userId: req.user.id }
    });

    if (!companyMember) {
      return next(new ApiError(400, "Company member not found"));
    }

    const companyId = companyMember.companyId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { status, listingType, search } = req.query;

    const query: any = {
      listing: { companyId }
    };

    if (status && status !== "all") {
      query.status = status;
    }

    if (listingType && Object.values(DraftType).includes(listingType as DraftType)) {
      query.listingType = listingType;
    }

    if (search) {
      query.OR = [
        { jobSeeker: { firstName: { contains: search as string, mode: 'insensitive' } } },
        { jobSeeker: { lastName: { contains: search as string, mode: 'insensitive' } } },
        { jobSeeker: { email: { contains: search as string, mode: 'insensitive' } } },
        { listing: { title: { contains: search as string, mode: 'insensitive' } } }
      ];
    }

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        companyId,
        status: "ACTIVE",
        expiryDate: { gt: new Date() }
      },
      include: { plan: true }
    });

    const canViewResume = activeSubscription?.plan?.allowResumeDownload === true;

    const [applicationsDocs, totalApplications] = await Promise.all([
      prisma.application.findMany({
        where: query,
        include: {
          listing: {
            select: { title: true, company: { select: { name: true } }, opportunityType: true, workMode: true }
          },
          jobSeeker: {
            select: { firstName: true, lastName: true, email: true, phone: true, skills: true, resume: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.application.count({ where: query })
    ]);

    const applications = applicationsDocs.map((app) => {
      if (!canViewResume && app.jobSeeker) {
        (app.jobSeeker as any).resume = null;
      }
      return app;
    });

    const totalPages = Math.ceil(totalApplications / limit);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          applications,
          pagination: {
            totalItems: totalApplications,
            totalPages,
            currentPage: page,
            limit,
          },
        },
        "Company applications fetched successfully",
      ),
    );
  } catch (error: any) {
    next(error);
  }
};

export const getJobApplicants = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { listingType, listingId } = req.body;

    const listing = await prisma.baseListing.findUnique({ where: { id: listingId } });
    if (!listing) {
      throw new ApiError(404, `${listingType} not found`);
    }

    const companyMember = await prisma.companyMember.findFirst({
      where: {
        companyId: listing.companyId,
        userId: req.user.id
      }
    });

    if (!companyMember || !["OWNER", "HR"].includes(companyMember.role)) {
      throw new ApiError(403, "Not authorized to view applicants");
    }

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        companyId: listing.companyId,
        status: "ACTIVE",
        expiryDate: { gt: new Date() }
      },
      include: { plan: true }
    });

    const canViewResume = activeSubscription?.plan?.allowResumeDownload === true;

    const applicationsDocs = await prisma.application.findMany({
      where: {
        listingId,
        listingType: listingType as DraftType
      },
      include: {
        jobSeeker: {
          select: { firstName: true, lastName: true, email: true, phone: true, skills: true, resume: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const applications = applicationsDocs.map((app) => {
      if (!canViewResume && app.jobSeeker) {
        (app.jobSeeker as any).resume = null;
      }
      return app;
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { count: applications.length, applications },
          "Applications fetched successfully",
        ),
      );
  } catch (error: any) {
    next(error);
  }
};

export const getApplicationById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const application = await prisma.application.findUnique({
      where: { id: id as string },
      include: {
        listing: {
          include: { company: true }
        },
        jobSeeker: {
          include: { resume: true }
        }
      }
    });

    if (!application) {
      throw new ApiError(404, "Application not found");
    }

    const isJobSeeker = application.jobSeekerId === req.user.id;
    const isEmployer = application.listing.postedById === req.user.id;

    let isCompanyMember = false;
    if (!isJobSeeker && !isEmployer) {
      const companyMember = await prisma.companyMember.findFirst({
        where: {
          userId: req.user.id,
          companyId: application.listing.companyId
        }
      });
      if (companyMember) isCompanyMember = true;
    }

    if (!isJobSeeker && !isEmployer && !isCompanyMember) {
      throw new ApiError(403, "Not authorized to view this application");
    }

    if (!isJobSeeker && (isEmployer || isCompanyMember)) {
      const activeSubscription = await prisma.subscription.findFirst({
        where: {
          companyId: application.listing.companyId,
          status: "ACTIVE",
          expiryDate: { gt: new Date() }
        },
        include: { plan: true }
      });

      const canViewResume = activeSubscription?.plan?.allowResumeDownload === true;

      if (!canViewResume && application.jobSeeker) {
        (application.jobSeeker as any).resume = null;
      }
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, application, "Application fetched successfully"),
      );
  } catch (error: any) {
    next(error);
  }
};

export const updateApplicationStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status, note, interviewDate } = req.body;

    const application = await prisma.application.findUnique({
      where: { id: id as string },
      include: { listing: true, jobSeeker: true }
    });

    if (!application) {
      throw new ApiError(404, "Application not found");
    }

    const companyMember = await prisma.companyMember.findFirst({
      where: {
        userId: req.user.id,
        companyId: application.listing.companyId
      }
    });

    const isEmployer = application.listing.postedById === req.user.id;
    const isAuthorizedMember = companyMember && ["OWNER", "HR"].includes(companyMember.role);

    if (!isEmployer && !isAuthorizedMember) {
      throw new ApiError(403, "Not authorized to update this application");
    }

    const updateData: any = {
      status: status as ApplicationStatus,
    };

    if (interviewDate) {
      updateData.interviewDate = new Date(interviewDate);
    }

    updateData.statusHistory = {
      create: {
        status: status as ApplicationStatus,
        changedById: req.user.id,
        note
      }
    };

    const updatedApplication = await prisma.application.update({
      where: { id: id as string },
      data: updateData
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedApplication,
          "Application status updated successfully",
        ),
      );
  } catch (error: any) {
    next(error);
  }
};
