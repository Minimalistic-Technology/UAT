import type { Request, Response, NextFunction } from "express";
import {
  ExperienceLevel,
  JobStatus,
  EmploymentType,
  OpportunityType,
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
import { getEmbedding, cosineSimilarity } from "../utils/embedding.js";

export function isValidJobType(value: any): value is EmploymentType {
  return Object.values(EmploymentType).includes(value);
}

export function isValidExperienceType(value: any): value is ExperienceLevel {
  return Object.values(ExperienceLevel).includes(value);
}

export function isValidWorkMode(value: any): value is string {
  const validWorkModes = [
    "remote",
    "work from office",
    "hybrid",
    "temporary work from home",
  ];
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
      employmentType: req.body.employmentType,
      workMode: req.body.workMode,
      companyType: req.body.companyType,
      roleCategory: req.body.roleCategory,
      industry: req.body.industry,
      experienceLevel: req.body.experienceLevel,
      experienceInYears: req.body.experienceInYears,
      openings: req.body.openings,

      location: {
        city: req.body.location?.city,
        state: req.body.location?.state,
        country: req.body.location?.country,
      },

      education: {
        minimumDegree: req.body.education.minimumDegree,
        preferredFields: req.body.education.preferredFields,
        isRequired: req.body.education.isRequired ?? false,
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
      genderPreference: req.body.genderPreference,
      englishFluency: req.body.englishFluency,

      applicationDeadline: req.body.applicationDeadline,
      isFeatured: req.body.isFeatured ?? false,
      status: req.body.status ?? "active",
      opportunityType: OpportunityType.JOB,
      postedBy: req.user.id,
      company: company._id,
      embedding: [] as number[],
    };

    // Pre-compute embedding
    const topSkills = (req.body.skills || []).slice(0, 3).join(", ");
    const textToEmbed = `${req.body.title} ${topSkills}`.trim();
    try {
      jobData.embedding = await getEmbedding(textToEmbed);
    } catch (err) {
      console.error("Failed to generate embedding:", err);
    }

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

    // Only hr and owner can update job details
    if (
      companyMember.role !== CompanyRole.HR &&
      companyMember.role !== CompanyRole.OWNER
    ) {
      return next(new ApiError(403, "Not authorized to update this job"));
    }

    // Update embedding if title or skills changed
    const updateData = { ...req.body };
    if (updateData.title || updateData.skills) {
      const topSkills = (updateData.skills || job.skills || []).slice(0, 3).join(", ");
      const textToEmbed = `${updateData.title || job.title} ${topSkills}`.trim();
      try {
        updateData.embedding = await getEmbedding(textToEmbed);
      } catch (err) {
        console.error("Failed to update embedding:", err);
      }
    }

    job = await Job.findByIdAndUpdate(req.params.id, updateData, {
      returnDocument: "after",
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

    // Soft delete the job so that job seekers who applied don't lose the listing details
    job.isDeleted = true;
    job.status = JobStatus.CLOSED; // Ensure it's not active anymore
    await job.save();

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
      const jobs = await Job.find({ company: companyMember.company, isDeleted: { $ne: true } })
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

export const getRelatedJobs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const jobId = req.params.id;
    const targetJob = await Job.findById(jobId).select("+embedding");
    if (!targetJob) {
      return next(new ApiError(404, "Job not found"));
    }

    // 1. Structured Field Matching (Category, City, Skills overlap)
    const baseQuery: any = {
      _id: { $ne: targetJob._id },
      status: JobStatus.ACTIVE,
      isDeleted: false,
    };

    const orConditions: any[] = [];
    if (targetJob.roleCategory) {
      orConditions.push({ roleCategory: targetJob.roleCategory });
    }
    if (targetJob.location?.city) {
      orConditions.push({ "location.city": targetJob.location.city });
    }
    if (targetJob.skills && targetJob.skills.length > 0) {
      orConditions.push({ skills: { $in: targetJob.skills } });
    }

    if (orConditions.length > 0) {
      baseQuery.$or = orConditions;
    }

    // Fetch up to 50 candidates to keep it fast
    const candidateJobs = await Job.find(baseQuery)
      .select("+embedding")
      .populate("company", "name logo location")
      .sort({ createdAt: -1 })
      .limit(50);

    if (candidateJobs.length === 0) {
      return res.status(200).json(new ApiResponse(200, [], "No related jobs found"));
    }

    // 2. Text Embedding Similarity
    // Ensure target job has an embedding
    if (!targetJob.embedding || targetJob.embedding.length === 0) {
      const topSkills = targetJob.skills?.slice(0, 3).join(", ") || "";
      const textToEmbed = `${targetJob.title} ${topSkills}`.trim();
      targetJob.embedding = await getEmbedding(textToEmbed);
      await targetJob.save({ validateBeforeSave: false });
    }
    const targetEmbedding = targetJob.embedding;

    const scoredJobs = await Promise.all(
      candidateJobs.map(async (job) => {
        let jobEmbedding = job.embedding;
        if (!jobEmbedding || jobEmbedding.length === 0) {
           const jobTopSkills = job.skills?.slice(0, 3).join(", ") || "";
           const textToEmbed = `${job.title} ${jobTopSkills}`.trim();
           jobEmbedding = await getEmbedding(textToEmbed);
           job.embedding = jobEmbedding;
           await job.save({ validateBeforeSave: false });
        }
        
        const sim = cosineSimilarity(targetEmbedding, jobEmbedding);
        
        // 3. Recency Boost
        // Add up to 0.1 score for fresh jobs, decaying to 0 over 60 days
        const ageInDays = (Date.now() - (job as any).createdAt.getTime()) / (1000 * 60 * 60 * 24);
        let recencyBoost = 0;
        if (ageInDays < 60 && ageInDays >= 0) {
           recencyBoost = 0.1 * (1 - ageInDays / 60);
        }
        
        const finalScore = sim + recencyBoost;
        return {
          job,
          sim,
          recencyBoost,
          finalScore
        };
      })
    );

    // Sort by final score descending and take top 5
    scoredJobs.sort((a, b) => b.finalScore - a.finalScore);
    const topRelated = scoredJobs.slice(0, 5).map(s => {
       const jobObj = s.job.toObject();
       delete jobObj.embedding; // do not send embeddings to client
       return jobObj;
    });

    return res.status(200).json(new ApiResponse(200, topRelated, "Related jobs fetched successfully"));
  } catch (error: any) {
    next(error);
  }
};
