import type { Response, NextFunction } from "express";
import Application, { ApplicationStatus } from "../models/Application.model.js";
import Job from "../models/Job.model.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { ApiResponse } from "../utils/apiResponse.js";
// import { sendEmail } from '../utils/email.js';
import { isValidParams } from "../lib/validate.js";
import { ApiError } from "../utils/apiError.js";

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

// @desc    Get user's applications
// @route   GET /api/applications/my-applications
// @access  Private (Job Seeker)
export const getMyApplications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const applications = await Application.find({ jobSeeker: req.user.id })
      .populate("job")
      .sort("-createdAt");

    return res
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

export const getJobApplicants = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { jobId } = req.params;

    const validJobId = isValidParams(jobId);

    if (!validJobId) {
      throw new ApiError(400, "Invalid job ID");
    }

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

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Employer)
export const updateApplicationStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status, note } = req.body;

    const application = await Application.findById(req.params.id)
      .populate("job")
      .populate("jobSeeker", "email firstName lastName");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Verify job belongs to employer
    const job: any = application.job;
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this application",
      });
    }

    // Update status
    application.status = status;
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

    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      data: application,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error updating application status",
      error: error.message,
    });
  }
};

// @desc    Withdraw application
// @route   DELETE /api/applications/:id
// @access  Private (Job Seeker)
export const withdrawApplication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Verify application belongs to user
    if (application.jobSeeker.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to withdraw this application",
      });
    }

    application.status = ApplicationStatus.WITHDRAWN;
    await application.save();

    res.status(200).json({
      success: true,
      message: "Application withdrawn successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error withdrawing application",
      error: error.message,
    });
  }
};
