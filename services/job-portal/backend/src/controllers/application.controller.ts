import type { Response, NextFunction } from 'express';
import Application, { ApplicationStatus } from '../models/Application.model.js';
import Job from '../models/Job.model.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
// import { sendEmail } from '../utils/email.js';

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Job Seeker)
export const applyForJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobId, resume, coverLetter } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      jobSeeker: req.user.id,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job',
      });
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      jobSeeker: req.user.id,
      resume: resume || req.user.resume,
      coverLetter,
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

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message,
    });
  }
};

// @desc    Get user's applications
// @route   GET /api/applications/my-applications
// @access  Private (Job Seeker)
export const getMyApplications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const applications = await Application.find({ jobSeeker: req.user.id })
      .populate('job')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message,
    });
  }
};

// @desc    Get applicants for a job
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer)
export const getJobApplicants = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobId } = req.params;

    // Verify job belongs to employer
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applicants',
      });
    }

    const applications = await Application.find({ job: jobId })
      .populate('jobSeeker', 'firstName lastName email phone skills experience education')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching applicants',
      error: error.message,
    });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Employer)
export const updateApplicationStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, note } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('jobSeeker', 'email firstName lastName');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Verify job belongs to employer
    const job: any = application.job;
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application',
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
      message: 'Application status updated successfully',
      data: application,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating application status',
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
  next: NextFunction
) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Verify application belongs to user
    if (application.jobSeeker.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this application',
      });
    }

    application.status = ApplicationStatus.WITHDRAWN;
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error withdrawing application',
      error: error.message,
    });
  }
};