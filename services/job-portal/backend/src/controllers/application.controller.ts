import type { Response, NextFunction } from "express";
import Application, { ApplicationStatus } from "../models/Application.model.js";
import Job from "../models/Job.model.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { ApiResponse } from "../utils/apiResponse.js";
// import { sendEmail } from '../utils/email.js';
import { ApiError } from "../utils/apiError.js";
import CompanyMember from "../models/CompanyMember.model.js";

export const applyForJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { jobId } = req.body;

    if (!req.user.resume) {
      throw new ApiError(400, "Resume is required to apply for this job");
    }

    const job = await Job.findById(jobId);
    if (!job) {
      throw new ApiError(404, "Job not found");
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      jobSeeker: req.user.id,
    });

    if (existingApplication) {
      throw new ApiError(400, "You have already applied for this job");
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      jobSeeker: req.user._id,
      resume: req.user.resume
    });

    // Increment applications count
    job.applicationsCount += 1;
    await job.save();

    // Send confirmation email
    // await sendEmail({
    //   email: req.user.email,
    //   subject: 'Application Submitted Successfully',
    //   message: `Your application for ${job.title} has been submitted successfully.`,
    // });

    res.status(201).json(new ApiResponse(201, application, "Application submitted successfully"));
  } catch (error: any) {
    next(error)
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
      Application.find({ jobSeeker: req.user.id })
        .populate("job")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Application.countDocuments({ jobSeeker: req.user.id })
    ]);

    const totalPages = Math.ceil(totalApplications / limit);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            applications,
            pagination: {
              totalItems: totalApplications,
              totalPages,
              currentPage: page,
              limit
            }
          },
          "Applications fetched successfully",
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
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      throw new ApiError(404, "Job not found");
    }

    if (job.postedBy.toString() !== req.user.id) {
      throw new ApiError(403, "Not authorized to view applicants");
    }

    const applications = await Application.find({ job: jobId })
      .populate(
        "jobSeeker",
        "firstName lastName email phone skills experience education",
      )
      .sort("-createdAt");

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


export const updateApplicationStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status, note, interviewDate } = req.body;

    const application = await Application.findById(req.params.id)
      .populate("job")
      .populate("jobSeeker", "email firstName lastName");

    if (!application) {
      throw new ApiError(404, "Application not found")
    }

    // Verify job belongs to employer
    const job: any = application.job;
    if (job.postedBy.toString() !== req.user.id) {
      throw new ApiError(403, "Not authorized to update this application")
    }

    // Update status
    application.status = status;
    if (interviewDate) {
      application.interviewDate = new Date(interviewDate);
    }
    application.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user.id,
      note,
    });

    await application.save();

    // Send notification email to job seeker
    const jobSeeker: any = application.jobSeeker;
    // await sendEmail({
    //   email: jobSeeker.email,
    //   subject: `Application Status Update - ${job.title}`,
    //   message: `Your application status has been updated to: ${status}${
    //     note ? `\n\nNote: ${note}` : ''
    //   }`,
    // });

    res.status(200).json(
      new ApiResponse(200, application, "Application status updated successfully"));
  } catch (error: any) {
    next(error)
  }
};

export const withdrawApplication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      throw new ApiError(404, "Application not found")
    }

    // Verify application belongs to user
    if (application.jobSeeker.toString() !== req.user.id) {
      throw new ApiError(403, "Not authorized to withdraw this application");
    }

    application.status = ApplicationStatus.WITHDRAWN;
    await application.save();

    res.status(200).json(new ApiResponse(200, null, "Application withdrawn successfully"));
  } catch (error: any) {
    next(error)
  }
};

export const getAllCompanyApplications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { status } = req.query;

    const companyMember = await CompanyMember.findOne({
      user: req.user.id,
    });

    if (!companyMember) {
      throw new ApiError(403, "You are not associated with any company.");
    }

    // Find all jobs belonging to the company
    const jobs = await Job.find({ company: companyMember.company }).select("_id");
    const jobIds = jobs.map((job) => job._id);

    const query: any = { job: { $in: jobIds } };
    if (status) {
      query.status = status;
    }

    const [applications, totalApplications] = await Promise.all([
      Application.find(query)
        .populate("job", "title location jobType")
        .populate("jobSeeker", "firstName lastName email phone")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Application.countDocuments(query),
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
        "Company applications fetched successfully",
      ),
    );
  } catch (error: any) {
    next(error);
  }
};
