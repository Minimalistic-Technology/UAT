import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { buildBaseJobQuery } from "../utils/buildBaseJobQuery.js";

export const getJobs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = buildBaseJobQuery(req.query as Record<string, any>, true);
    query.opportunityType = "JOB";

    const { experienceLevel, minSalary, maxSalary } = req.query;

    if (experienceLevel) {
      if (!query.jobDetails) query.jobDetails = { is: {} };
      query.jobDetails.is.experienceLevel = experienceLevel.toString().toUpperCase();
    }

    if (minSalary || maxSalary) {
      if (!query.jobDetails) query.jobDetails = { is: {} };
      if (minSalary) {
        if (!query.jobDetails.is.salaryMin) query.jobDetails.is.salaryMin = {};
        query.jobDetails.is.salaryMin.gte = Number(minSalary);
      }
      if (maxSalary) {
        if (!query.jobDetails.is.salaryMax) query.jobDetails.is.salaryMax = {};
        query.jobDetails.is.salaryMax.lte = Number(maxSalary);
      }
    }

    const pageNumber = Number(req.query.page) || 1;
    const limitNumber = Number(req.query.limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const [jobs, total] = await Promise.all([
      prisma.baseListing.findMany({
        where: query,
        orderBy: { createdAt: "desc" },
        include: {
          postedBy: { select: { firstName: true, lastName: true } },
          company: { select: { name: true, logo: true, locations: { select: { city: true, state: true, country: true } }, industry: true } },
          jobDetails: true,
        },
        skip,
        take: limitNumber,
      }),
      prisma.baseListing.count({ where: query }),
    ]);

    let formattedJobs = [...jobs];

    if (req.user && req.user.role === "USER" && !req.user.isEmployer) {
      const jobIds = jobs.map((job) => job.id);

      const applications = await prisma.application.findMany({
        where: {
          jobSeekerId: req.user.id,
          listingId: { in: jobIds },
        },
      });

      const appliedJobIds = new Set(
        applications.map((app) => app.listingId),
      );

      formattedJobs = jobs.map((job) => ({
        ...job,
        hasApplied: appliedJobIds.has(job.id),
      }));
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          jobs: formattedJobs,
          totalJobs: total,
          pagination: {
            page: pageNumber,
            totalPages: Math.ceil(total / limitNumber),
          },
        },
        "Jobs fetched successfully",
      ),
    );
  } catch (error: any) {
    next(error);
  }
};

export const getJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;

    const job = await prisma.baseListing.findUnique({
      where: { id },
      include: {
        postedBy: { select: { firstName: true, lastName: true, email: true } },
        company: { select: { name: true, logo: true, description: true, website: true, locations: true, industry: true, companySize: true } },
        jobDetails: true,
      }
    });

    if (!job || job.opportunityType !== "JOB") {
      return next(new ApiError(404, "Job not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, job, "Job fetched successfully"));
  } catch (error: any) {
    next(error);
  }
};

export const createJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;

    const companyMember = await prisma.companyMember.findFirst({
      where: { userId },
      include: { company: true },
    });

    if (!companyMember) {
      throw new ApiError(400, "Company member doesn't exist.");
    }

    const company = companyMember.company;

    if (!company.isVerified) {
      throw new ApiError(
        403,
        "Your company must be verified before you can post jobs.",
      );
    }

    if (
      companyMember.role !== "OWNER" &&
      companyMember.role !== "HR"
    ) {
      throw new ApiError(403, "You're not authorized to create a job");
    }

    const job = await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.findFirst({
        where: {
          companyId: company.id,
          status: "ACTIVE",
          expiryDate: { gt: new Date() },
          OR: [{ postsRemaining: { gt: 0 } }, { postsRemaining: -1 }],
        },
      });

      if (!subscription) {
        throw new ApiError(
          402,
          "You must have an active subscription with remaining job posts. Please upgrade your plan.",
        );
      }

      const newListing = await tx.baseListing.create({
        data: {
          title: req.body.title,
          description: req.body.description,
          employmentType: req.body.employmentType,
          workMode: req.body.workMode,
          companyType: req.body.companyType,
          roleCategory: req.body.roleCategory,
          industry: req.body.industry,
          experienceLevel: req.body.experienceLevel,
          openings: req.body.openings,
          city: req.body.location?.city,
          state: req.body.location?.state,
          country: req.body.location?.country,
          minimumDegree: req.body.education?.minimumDegree || "ANY",
          preferredFields: req.body.education?.preferredFields || [],
          isDegreeRequired: req.body.education?.isRequired ?? false,
          skills: req.body.skills || [],
          requirements: req.body.requirements || [],
          benefits: req.body.benefits || [],
          genderPreference: req.body.genderPreference || "ANY",
          englishFluency: req.body.englishFluency || "NONE",
          applicationDeadline: req.body.applicationDeadline,
          status: req.body.status ?? "ACTIVE",
          opportunityType: "JOB",
          postedById: userId,
          companyId: company.id,
          jobDetails: {
            create: {
              experienceLevel: req.body.experienceLevel,
              experienceInYears: req.body.experienceInYears,
              salaryMin: req.body.salary?.min,
              salaryMax: req.body.salary?.max,
              salaryCurrency: req.body.salary?.currency || "USD",
              salaryPeriod: req.body.salary?.period || "YEARLY",
            }
          }
        },
        include: { jobDetails: true }
      });

      if (subscription.postsRemaining !== -1) {
        await tx.subscription.update({
          where: { id: subscription.id },
          data: {
            postsRemaining: subscription.postsRemaining - 1,
            status: subscription.postsRemaining - 1 === 0 ? "DEPLETED" : "ACTIVE",
          },
        });
      }

      return newListing;
    });

    res.status(201).json(new ApiResponse(201, job, "Job created successfully"));
  } catch (error: any) {
    next(error);
  }
};

export const updateJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const jobId = req.params.id as string;
    let job = await prisma.baseListing.findUnique({
      where: { id: jobId },
      include: { jobDetails: true },
    });

    if (!job || job.opportunityType !== "JOB") {
      return next(new ApiError(404, "Job not found"));
    }

    const companyMember = await prisma.companyMember.findFirst({
      where: { userId: req.user.id },
    });

    if (!companyMember || companyMember.companyId !== job.companyId) {
      return next(
        new ApiError(
          403,
          `${req.user.firstName} ${req.user.lastName} is not authorized for this company`,
        ),
      );
    }

    if (
      companyMember.role !== "HR" &&
      companyMember.role !== "OWNER"
    ) {
      return next(new ApiError(403, "Not authorized to update this job"));
    }

    const {
      salary,
      experienceInYears,
      education,
      location,
      ...baseUpdates
    } = req.body;

    // Filter out Prisma-incompatible fields and keep only scalar values
    const allowedBaseUpdates = [
      "title", "description", "employmentType", "workMode", "companyType", 
      "roleCategory", "industry", "experienceLevel", "openings", "skills", 
      "requirements", "benefits", "genderPreference", "englishFluency", 
      "applicationDeadline", "status", "isDeleted"
    ];
    
    const filteredBaseUpdates: any = {};
    for (const key of allowedBaseUpdates) {
      if (baseUpdates[key] !== undefined) {
        filteredBaseUpdates[key] = baseUpdates[key];
      }
    }

    const updatedJob = await prisma.$transaction(async (tx) => {
      await tx.baseListing.update({
        where: { id: job.id },
        data: {
          ...filteredBaseUpdates,
          ...(location && {
             city: location.city,
             state: location.state,
             country: location.country
          }),
          ...(education && {
             minimumDegree: education.minimumDegree,
             preferredFields: education.preferredFields,
             isDegreeRequired: education.isRequired
          })
        },
      });

      if (salary || experienceInYears !== undefined || req.body.experienceLevel !== undefined) {
        await tx.job.update({
          where: { listingId: job.id },
          data: {
             ...(req.body.experienceLevel !== undefined && { experienceLevel: req.body.experienceLevel }),
             ...(experienceInYears !== undefined && { experienceInYears: experienceInYears }),
             ...(salary?.min !== undefined && { salaryMin: salary.min }),
             ...(salary?.max !== undefined && { salaryMax: salary.max }),
             ...(salary?.currency && { salaryCurrency: salary.currency }),
             ...(salary?.period && { salaryPeriod: salary.period })
          }
        });
      }

      return tx.baseListing.findUnique({
         where: { id: job.id },
         include: { jobDetails: true }
      });
    });

    res.status(200).json(new ApiResponse(200, updatedJob, "Job updated successfully"));
  } catch (error: any) {
    next(error);
  }
};

export const deleteJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const jobId = req.params.id as string;
    const job = await prisma.baseListing.findUnique({
      where: { id: jobId },
    });

    if (!job || job.opportunityType !== "JOB") {
      return next(new ApiError(404, "Job not found"));
    }

    const companyMember = await prisma.companyMember.findFirst({
      where: { userId: req.user.id },
    });

    if (!companyMember || companyMember.companyId !== job.companyId) {
       return next(new ApiError(403, "You're not authorized to delete the job"));
    }

    if (
      companyMember.role !== "HR" &&
      companyMember.role !== "OWNER"
    ) {
      return next(new ApiError(403, "You're not authorized to delete the job"));
    }

    await prisma.baseListing.update({
      where: { id: job.id },
      data: {
         isDeleted: true,
         status: "CLOSED"
      }
    });

    res.status(200).json(new ApiResponse(200, {}, "Job deleted successfully"));
  } catch (error: any) {
    next(error);
  }
};

export const getMyJobs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const companyMember = await prisma.companyMember.findFirst({
      where: { userId: req.user.id },
    });

    if (!companyMember) {
      return next(new ApiError(400, "Company member not found"));
    }

    if (
      companyMember.role === "HR" ||
      companyMember.role === "OWNER"
    ) {
      const jobs = await prisma.baseListing.findMany({
        where: {
           companyId: companyMember.companyId,
           isDeleted: false,
           opportunityType: "JOB"
        },
        include: {
           company: { select: { name: true, logo: true } },
           postedBy: { select: { firstName: true, lastName: true } },
           jobDetails: true
        }
      });

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            count: jobs.length,
            jobPosts: jobs,
          },
          "Jobs fetched successfully",
        ),
      );
    } else {
      return next(new ApiError(403, "Not authorized to fetch jobs"));
    }
  } catch (error: any) {
    next(error);
  }
};

export const getRelatedJobs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const jobId = req.params.id as string;
    const targetJob = await prisma.baseListing.findUnique({
      where: { id: jobId }
    });
    
    if (!targetJob || targetJob.opportunityType !== "JOB") {
      return next(new ApiError(404, "Job not found"));
    }

    // Basic related logic since vector embeddings are removed from postgres schema
    const baseQuery: any = {
      id: { not: targetJob.id },
      status: "ACTIVE",
      isDeleted: false,
      opportunityType: "JOB",
    };

    const orConditions: any[] = [];
    if (targetJob.roleCategory) {
      orConditions.push({ roleCategory: targetJob.roleCategory });
    }
    if (targetJob.city) {
      orConditions.push({ city: targetJob.city });
    }
    if (targetJob.skills && targetJob.skills.length > 0) {
      orConditions.push({ skills: { hasSome: targetJob.skills } });
    }

    if (orConditions.length > 0) {
      baseQuery.OR = orConditions;
    }

    const candidateJobs = await prisma.baseListing.findMany({
      where: baseQuery,
      include: {
         company: { select: { name: true, logo: true, locations: { select: { city: true } } } },
         jobDetails: true
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    return res.status(200).json(new ApiResponse(200, candidateJobs, "Related jobs fetched successfully"));
  } catch (error: any) {
    next(error);
  }
};
