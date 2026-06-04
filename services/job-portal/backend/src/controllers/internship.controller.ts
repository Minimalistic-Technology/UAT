import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import Internship from "../models/Internship.model.js";
import { GlobalRole } from "../models/User.model.js";
import mongoose from "mongoose";
import CompanyMember, { CompanyRole } from "../models/CompanyMember.model.js";
import Company from "../models/Company.model.js";
import Subscription from "../models/Subscription.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { buildBaseJobQuery } from "../utils/buildBaseJobQuery.js";
import { isValidExperienceType } from "./job.controller.js";
import { JobStatus, OpportunityType } from "../models/BaseJob.model.js";

export const getAllInternships = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = buildBaseJobQuery(req.query as Record<string, any>);

    const { experienceLevel, minStipend, maxStipend, stipendType } = req.query;

    if (experienceLevel) {
      if (!isValidExperienceType(experienceLevel))
        return next(new ApiError(400, "Invalid experience type"));
      query.experienceLevel = experienceLevel;
    }

    if (minStipend || maxStipend) {
      query["stipend.amount"] = {};
      if (minStipend) query["stipend.amount"].$gte = Number(minStipend);
      if (maxStipend) query["stipend.amount"].$lte = Number(maxStipend);
    }
    
    if (stipendType) {
        query["stipend.type"] = stipendType;
    }

    const { page, limit } = req.query;

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const [internships, total] = await Promise.all([
      Internship.find(query)
        .sort({ createdAt: -1 })
        .populate("postedBy", "firstName lastName")
        .populate("company", "name logo location industry")
        .skip(skip)
        .limit(limitNumber),
      Internship.countDocuments(query),
    ]);

    // Format plain objects so we can append properties
    const internshipsWithDetails: any[] = internships.map((internship) => internship.toObject());
    let formattedInternships = [...internshipsWithDetails];

    // Check if user is logged in as a job seeker to attach 'hasApplied' field
    if (req.user && req.user.role === GlobalRole.USER && !req.user.isEmployer) {
      const Application = (await import("../models/Application.model.js")).default;

      const internshipIds = internshipsWithDetails.map((internship) => internship._id);

      const applications = await Application.find({
        jobSeeker: req.user._id,
        job: { $in: internshipIds },
      });

      const appliedInternshipIds = new Set(
        applications.map((app) => app.listing.toString()),
      );

      formattedInternships = internshipsWithDetails.map((internship) => ({
        ...internship,
        hasApplied: appliedInternshipIds.has(internship._id.toString()),
      }));
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          internships: formattedInternships,
          totalInternships: total,
          pagination: {
            page: pageNumber,
            totalPages: Math.ceil(total / limitNumber),
          },
        },
        "Internships fetched successfully",
      ),
    );
  } catch (error: any) {
    next(error);
  }
};

export const getMyInternships = async (
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
      const internships = await Internship.find({ company: companyMember.company, isDeleted: { $ne: true } })
        .populate("company", "name logo")
        .populate("postedBy", "firstName lastName");

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            count: internships.length,
            internshipPosts: internships,
          },
          "Internships fetched successfully",
        ),
      );
    } else {
      return next(new ApiError(403, "Not authorized to fetch internships"));
    }
  } catch (error: any) {
    next(error);
  }
};

export const getInternshipById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id;

    const internship = await Internship.findById(id)
      .populate("postedBy", "firstName lastName email")
      .populate(
        "company",
        "name logo description website location industry companySize",
      );

    if (!internship) {
      return next(new ApiError(404, "Internship not found"));
    }

    internship.viewsCount = (internship.viewsCount || 0) + 1;
    await internship.save();

    return res
      .status(200)
      .json(new ApiResponse(200, internship, "Internship fetched successfully"));
  } catch (error: any) {
    next(error);
  }
};

export const createInternship = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
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
        "Your company must be verified before you can post internships.",
      );
    }

    if (
      companyMember.role !== CompanyRole.OWNER &&
      companyMember.role !== CompanyRole.HR
    ) {
      throw new ApiError(403, "You're not authorized to create an internship");
    }

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

    const internshipData = {
      title: req.body.title,
      description: req.body.description,
      employmentType: req.body.employmentType,
      workMode: req.body.workMode,
      companyType: req.body.companyType,
      openings: req.body.openings,
      roleCategory: req.body.roleCategory,
      industry: req.body.industry,
      education: req.body.education,

      location: {
        city: req.body.location?.city,
        state: req.body.location?.state,
        country: req.body.location?.country,
      },

      stipend: req.body.stipend,
      duration: req.body.duration,
      isPPO: req.body.isPPO,
      startDate: req.body.startDate,
      certificateProvided: req.body.certificateProvided,

      skills: req.body.skills,
      requirements: req.body.requirements,
      benefits: req.body.benefits,

      applicationDeadline: req.body.applicationDeadline,
      isFeatured: req.body.isFeatured,
      opportunityType: OpportunityType.INTERNSHIP,
      postedBy: req.user.id,
      company: company._id,
    };

    const [internship] = await Internship.create([internshipData], { session });

    if (subscription.postsRemaining !== -1) {
      subscription.postsRemaining -= 1;
      await subscription.save({ session });
    }

    await session.commitTransaction();

    res.status(201).json(new ApiResponse(201, internship, "Internship created successfully"));
  } catch (error: any) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
};

export const updateInternship = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    let internship = await Internship.findById(req.params.id);

    if (!internship) {
      return next(new ApiError(404, "Internship not found"));
    }

    const companyMember = await CompanyMember.findOne({
      user: req.user._id,
    }).populate("company", "name");

    if (!companyMember) {
      return next(
        new ApiError(
          404,
          `${req.user.firstName} ${req.user.lastName} is not a member of the company`,
        ),
      );
    }

    if (
      companyMember.role !== CompanyRole.ADMIN &&
      companyMember.role !== CompanyRole.OWNER
    ) {
      return next(new ApiError(403, "Not authorized to update this internship"));
    }

    internship = await Internship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(new ApiResponse(200, internship, "Internship updated successfully"));
  } catch (error: any) {
    next(error);
  }
};

export const deleteInternship = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return next(new ApiError(404, "Internship not found"));
    }

    const companyMember = await CompanyMember.findOne({
      user: req.user._id,
    }).populate("company", "name");

    if (!companyMember) {
      return next(
        new ApiError(
          404,
          `${req.user.firstName} ${req.user.lastName} is not a member of the company`,
        ),
      );
    }

    if (
      companyMember.role !== CompanyRole.HR &&
      companyMember.role !== CompanyRole.OWNER
    ) {
      return next(new ApiError(403, "You're not authorized to delete the internship"));
    }

    // Soft delete the internship so that job seekers who applied don't lose the listing details
    internship.isDeleted = true;
    internship.status = JobStatus.CLOSED; // Ensure it's not active anymore
    await internship.save();

    res.status(200).json(new ApiResponse(200, {}, "Internship deleted successfully"));
  } catch (error: any) {
    next(error);
  }
};