import type { Request, Response, NextFunction } from "express";
import {
  ExperienceLevel,
  JobStatus,
  JobType,
} from "../models/BaseJob.model.js";
import Job from "../models/Job.model.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { GlobalRole } from "../models/User.model.js";
import mongoose from "mongoose";
import CompanyMember, { CompanyRole } from "../models/CompanyMember.model.js";
import Company from "../models/Company.model.js";
import Subscription from "../models/Subscription.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { buildBaseJobQuery } from "../utils/buildBaseJobQuery.js";

export function isValidJobType(value: any): value is JobType {
  return Object.values(JobType).includes(value);
}

export function isValidExperienceType(value: any): value is ExperienceLevel {
  return Object.values(ExperienceLevel).includes(value);
}

export function isValidWorkMode(value: any): value is string {
    const validWorkModes = ["remote", "work from office", "hybrid", "temporary work from home"];
    return validWorkModes.includes(value);
}

export const getJobs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = buildBaseJobQuery(req.query as Record<string, any>);

    const { experienceLevel, minSalary, maxSalary } = req.query;

    if (experienceLevel) {
      if (!isValidExperienceType(experienceLevel))
        return next(new ApiError(400, "Invalid experience type"));
      query.experienceLevel = experienceLevel;
    }

    if (minSalary || maxSalary) {
      query["salary.min"] = {};
      if (minSalary) query["salary.min"].$gte = Number(minSalary);
      if (maxSalary) query["salary.max"] = { $lte: Number(maxSalary) };
    }

    const { page, limit } = req.query;

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;


    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1 })
        .populate("postedBy", "firstName lastName")
        .populate("company", "name logo location industry")
        .skip(skip)
        .limit(limitNumber),
      Job.countDocuments(query),
    ]);

    // Format plain objects so we can append properties
    const jobsWithDetails: any[] = jobs.map((job) => job.toObject());
    let formattedJobs = [...jobsWithDetails];

    // Check if user is logged in as a job seeker to attach 'hasApplied' field
    if (req.user && req.user.role === GlobalRole.USER && !req.user.isEmployer) {
      // Import Application model locally to avoid circular dependencies if any are introduced later
      const Application = (await import("../models/Application.model.js"))
        .default;

      const jobIds = jobsWithDetails.map((job) => job._id);

      const applications = await Application.find({
        jobSeeker: req.user._id,
        job: { $in: jobIds },
      });

      const appliedJobIds = new Set(
        applications.map((app) => app.listing.toString()),
      );

      formattedJobs = jobsWithDetails.map((job) => ({
        ...job,
        hasApplied: appliedJobIds.has(job._id.toString()),
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
    const id = req.params.id;

    const job = await Job.findById(id)
      .populate("postedBy", "firstName lastName email")
      .populate(
        "company",
        "name logo description website location industry companySize",
      );

    if (!job) {
      return next(new ApiError(404, "Job not found"));
    }

    job.viewsCount = (job.viewsCount || 0) + 1;
    await job.save();

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
  // 1. Start a Session for the Transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;

    const companyMember = await CompanyMember.findOne({ user: userId }).session(
      session,
    );

    if (!companyMember) {
      throw new ApiError(400, "Company member doesn't exist.");
    }

    const company = await Company.findById(companyMember.company).session(
      session,
    );

    if (!company) {
      throw new ApiError(404, "No such company exists");
    }

    if (!company.isVerified) {
      throw new ApiError(
        403,
        "Your company must be verified before you can post jobs.",
      );
    }

    if (
      companyMember.role !== CompanyRole.OWNER &&
      companyMember.role !== CompanyRole.HR
    ) {
      throw new ApiError(403, "You're not authorized to create a job");
    }

    // Validate active subscription within the session
    const subscription = await Subscription.findOne({
      employerId: company.owner,
      status: "active",
      expiryDate: { $gt: new Date() },
      $or: [{ postsRemaining: { $gt: 0 } }, { postsRemaining: -1 }],
    }).session(session);

    if (!subscription) {
      throw new ApiError(
        402,
        "You must have an active subscription with remaining job posts. Please upgrade your plan.",
      );
    }

    const jobData = {
      title: req.body.title,
      description: req.body.description,
      jobType: req.body.jobType,
      experienceLevel: req.body.experienceLevel,
      openings: req.body.openings,

      location: {
        city: req.body.location.city,
        state: req.body.location.state,
        country: req.body.location.country,
        remote: req.body.location.remote,
      },

      salary: {
        min: req.body.salary?.min,
        max: req.body.salary?.max,
        currency: req.body.salary?.currency,
        period: req.body.salary?.period,
      },

      skills: req.body.skills,
      requirements: req.body.requirements,
      benefits: req.body.benefits,

      applicationDeadline: req.body.applicationDeadline,
      isFeatured: req.body.isFeatured,
      postedBy: req.user.id,
      company: company._id,
    };

    const [job] = await Job.create([jobData], { session });

    // Deduct from plan tally (Update local object and save with session)
    if (subscription.postsRemaining !== -1) {
      subscription.postsRemaining -= 1;
      // The pre-save hook we wrote earlier will handle status: "depleted" automatically
      await subscription.save({ session });
    }

    await session.commitTransaction();

    res.status(201).json(new ApiResponse(201, job, "Job created successfully"));
  } catch (error: any) {
    await session.abortTransaction();

    next(error);
  } finally {
    await session.endSession();
  }
};

export const updateJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return next(new ApiError(404, "Job not found"));
    }

    const companyMember = await CompanyMember.findOne({
      user: req.user._id,
    }).populate("company", "name");

    if (!companyMember) {
      return next(
        new ApiError(
          404,
          `${req.user.firstName} ${req.user.lastName} is not a memeber of the company`,
        ),
      );
    }

    // Only admin and owner can update job details
    if (
      companyMember.role !== CompanyRole.ADMIN &&
      companyMember.role !== CompanyRole.OWNER
    ) {
      return next(new ApiError(403, "Not authorized to update this job"));
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(new ApiResponse(200, job, "Job updated successfully"));
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
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new ApiError(404, "Job not found"));
    }

    const companyMember = await CompanyMember.findOne({
      user: req.user._id,
    }).populate("company", "name");

    if (!companyMember) {
      return next(
        new ApiError(
          404,
          `${req.user.firstName} ${req.user.lastName} is not a memeber of the company`,
        ),
      );
    }

    // Only hr and owner can delete the job
    if (
      companyMember.role !== CompanyRole.HR &&
      companyMember.role !== CompanyRole.OWNER
    ) {
      return next(new ApiError(403, "You're not authorized to delete the job"));
    }

    await job.deleteOne();

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
    const companyMember = await CompanyMember.findOne({ user: req.user._id });

    if (!companyMember) {
      return next(new ApiError(400, "Company member not found"));
    }

    if (
      companyMember.role === CompanyRole.HR ||
      companyMember.role === CompanyRole.OWNER
    ) {
      const jobs = await Job.find({ company: companyMember.company })
        .populate("company", "name logo")
        .populate("postedBy", "firstName lastName");

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
