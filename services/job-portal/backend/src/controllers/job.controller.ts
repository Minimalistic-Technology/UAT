import type { Response, NextFunction } from "express";
import Job, { JobStatus } from "../models/Job.model.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { GlobalRole } from "../models/User.model.js";
import mongoose from "mongoose";
import CompanyMember, { CompanyRole } from "../models/CompanyMember.model.js";
import User from "../models/User.model.js";
import Company from "../models/Company.model.js";

// @desc    Get all jobs with filters
// @route   GET /api/jobs
// @access  Public
// @desc    Get all jobs with filters
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      search,
      location,
      jobType,
      experienceLevel,
      minSalary,
      maxSalary,
      skills,
      remote,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    // Build query
    const query: any = { status: JobStatus.ACTIVE };

    // Text search
    if (search) {
      query.$text = { $search: search as string };
    }

    // Location filter
    if (location) {
      query["location.city"] = new RegExp(location as string, "i");
    }

    // Job type filter
    if (jobType) {
      query.jobType = jobType;
    }

    // Experience level filter
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    // Salary range filter
    if (minSalary || maxSalary) {
      query["salary.min"] = {};
      if (minSalary) query["salary.min"].$gte = Number(minSalary);
      if (maxSalary) query["salary.max"].$lte = Number(maxSalary);
    }

    // Skills filter
    if (skills) {
      const skillsArray = (skills as string).split(",");
      query.skills = { $in: skillsArray };
    }

    // Remote filter
    if (remote === "true") {
      query["location.remote"] = true;
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const jobs = await Job.find(query)
      .populate("postedBy", "firstName lastName")
      .populate("company", "name logo location industry")
      .sort(sort as string)
      .skip(skip)
      .limit(limitNum);

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: jobs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching jobs",
      error: error.message,
    });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public

export const getJob = async (req: AuthRequest, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const cleanId = id.trim();

    if (!mongoose.Types.ObjectId.isValid(cleanId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job id",
      });
    }

    const job = await Job.findById(cleanId)
      .populate("postedBy", "firstName lastName email")
      .populate(
        "company",
        "name logo description website location industry companySize",
      );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    job.viewsCount = (job.viewsCount || 0) + 1;
    await job.save();

    return res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Get Job Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching job",
    });
  }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Owner)
export const createJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;

    const companyMember = await CompanyMember.findOne({ user: userId });

    if (!companyMember) {
      return res
        .status(400)
        .json({ success: false, message: "Company member doesn't exists." });
    }

    const company = await Company.findById(companyMember.company);

    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "No such company exists" });
    }

    if (
      companyMember.role !== CompanyRole.OWNER &&
      companyMember.role !== CompanyRole.ADMIN
    ) {
      return res.status(403).json({
        success: false,
        message: "You're not not authorized to create a job",
      });
    }

    // Add user and company to req.body
    req.body.postedBy = req.user.id;
    req.body.company = company._id;

    console.log("Creating job:", req.user);
    const job = await Job.create(req.body);

    res.status(201).json({
      success: true,
      data: job,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error creating job",
      error: error.message,
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Employer - owner only)
export const updateJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const companyMember = await CompanyMember.findOne({
      user: req.user._id,
    }).populate("company", "name");

    if (!companyMember) {
      return res.status(404).json({
        success: false,
        message: `${req.user.firstName} ${req.user.lastName} is not a memeber of the company`,
      });
    }

    // Only admin and owner can update job details
    if (
      companyMember.role !== CompanyRole.ADMIN &&
      companyMember.role !== CompanyRole.OWNER
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this job",
      });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error updating job",
      error: error.message,
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer - owner only)
export const deleteJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const companyMember = await CompanyMember.findOne({
      user: req.user.id,
    }).populate("company", "name");

    if (!companyMember) {
      return res.status(404).json({
        success: false,
        message: `${req.user.firstName} ${req.user.lastName} is not a memeber of the company`,
      });
    }

    // Only admin and owner can delete the job
    if (
      req.user.role !== CompanyRole.ADMIN ||
      req.user.role !== CompanyRole.OWNER
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this job",
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error deleting job",
      error: error.message,
    });
  }
};

// @desc    Get jobs posted by logged in employer
// @route   GET /api/jobs/my-jobs
// @access  Private (Owner and admin)
export const getMyJobs = async (req: AuthRequest, res: Response) => {
  try {
    const companyMember = await CompanyMember.findOne({ user: req.user.id });

    if (!companyMember) {
      return res
        .status(400)
        .json({ success: false, message: "Company member not found" });
    }

    if (
      companyMember.role === CompanyRole.ADMIN ||
      companyMember.role === CompanyRole.OWNER
    ) {
      const jobs = await Job.find({ company: companyMember.company }).populate(
        "company",
        "name logo",
      );

      res.status(200).json({
        success: true,
        count: jobs.length,
        data: jobs,
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching jobs",
      error: error.message,
    });
  }
};
