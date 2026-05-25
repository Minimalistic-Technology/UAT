import type { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { GlobalRole } from "../models/User.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { buildBaseJobQuery } from "../utils/buildBaseJobQuery.js";
import { isValidExperienceType } from "./job.controller.js";
import Job from "../models/Job.model.js";

export const getListings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const jobQuery = buildBaseJobQuery(req.query as Record<string, any>);
    const internshipQuery = buildBaseJobQuery(req.query as Record<string, any>);

    const { experienceLevel, minSalary, maxSalary, minStipend, maxStipend, stipendType } = req.query;

    const { experienceYears, durationMonths } = req.query;

    if (experienceYears !== undefined && experienceYears !== "Any") {
      const years = Number(experienceYears);
      if (!isNaN(years)) {
        jobQuery.experienceInYears = { $lte: years };
      }
    }

    if (durationMonths) {
      const durationArray = Array.isArray(durationMonths) ? durationMonths : durationMonths.toString().split(",");
      if (durationArray.length > 0) {
        internshipQuery["duration.value"] = { $in: durationArray.map(Number) };
        // Assuming unit is always 'months' for these checkboxes
        internshipQuery["duration.unit"] = "months";
      }
    }

    if (minSalary || maxSalary) {
      jobQuery["salary.min"] = {};
      if (minSalary) jobQuery["salary.min"].$gte = Number(minSalary);
      if (maxSalary) jobQuery["salary.max"] = { $lte: Number(maxSalary) };
    }

    if (minStipend || maxStipend) {
      internshipQuery["stipend.amount"] = {};
      if (minStipend) internshipQuery["stipend.amount"].$gte = Number(minStipend);
      if (maxStipend) internshipQuery["stipend.amount"].$lte = Number(maxStipend);
    }
    
    if (stipendType) {
      internshipQuery["stipend.type"] = stipendType;
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      { $match: jobQuery },
      { $addFields: { listingType: 'job' } },
      {
        $unionWith: {
          coll: 'internships',
          pipeline: [
            { $match: internshipQuery },
            { $addFields: { listingType: 'internship' } }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "users",
                localField: "postedBy",
                foreignField: "_id",
                as: "postedBy"
              }
            },
            { $unwind: { path: "$postedBy", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "companies",
                localField: "company",
                foreignField: "_id",
                as: "company"
              }
            },
            { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
            // Project to match populate format
            {
              $addFields: {
                "postedBy": {
                  _id: "$postedBy._id",
                  firstName: "$postedBy.firstName",
                  lastName: "$postedBy.lastName",
                },
                "company": {
                  _id: "$company._id",
                  name: "$company.name",
                  logo: "$company.logo",
                  location: "$company.location",
                  industry: "$company.industry"
                }
              }
            }
          ]
        }
      }
    ];

    const results = await Job.aggregate(pipeline);

    const total = results[0]?.metadata[0]?.total || 0;
    const listings = results[0]?.data || [];

    let formattedListings = [...listings];

    if (req.user && req.user.role === GlobalRole.USER && !req.user.isEmployer) {
      const Application = (await import("../models/Application.model.js")).default;
      const listingIds = listings.map((listing: any) => listing._id);

      const applications = await Application.find({
        jobSeeker: req.user._id,
        listing: { $in: listingIds },
      });

      const appliedListingIds = new Set(
        applications.map((app) => app.listing.toString()),
      );

      formattedListings = listings.map((listing: any) => ({
        ...listing,
        hasApplied: appliedListingIds.has(listing._id.toString()),
      }));
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          jobs: formattedListings, // Using `jobs` key so frontend doesn't break
          totalJobs: total,
          pagination: {
            page,
            totalPages: Math.ceil(total / limit),
          },
        },
        "Listings fetched successfully",
      ),
    );
  } catch (error: any) {
    next(error);
  }
};
