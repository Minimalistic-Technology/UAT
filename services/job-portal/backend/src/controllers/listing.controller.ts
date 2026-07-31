import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { buildBaseJobQuery } from "../utils/buildBaseJobQuery.js";
import { prisma } from "../lib/prisma.js";

export const getListings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = buildBaseJobQuery(req.query as Record<string, any>);

    if (req.query.company) {
      query.companyId = req.query.company as string;
    }

    const {
      minSalary,
      maxSalary,
      minStipend,
      maxStipend,
      stipendType,
      experienceYears,
      durationMonths,
    } = req.query;

    const jobDetailsFilter: any = {};
    const internshipDetailsFilter: any = {};

    let hasJobFilter = false;
    let hasInternshipFilter = false;

    if (experienceYears !== undefined && experienceYears !== "Any") {
      const years = Number(experienceYears);
      if (!isNaN(years)) {
        jobDetailsFilter.experienceInYears = { lte: years };
        hasJobFilter = true;
      }
    }

    if (minSalary || maxSalary) {
      if (minSalary) {
        jobDetailsFilter.salaryMin = { gte: Number(minSalary) };
      }
      if (maxSalary) {
        jobDetailsFilter.salaryMax = { lte: Number(maxSalary) };
      }
      hasJobFilter = true;
    }

    if (durationMonths) {
      const durationArray = Array.isArray(durationMonths)
        ? durationMonths
        : durationMonths.toString().split(",");
      if (durationArray.length > 0) {
        internshipDetailsFilter.durationValue = {
          in: durationArray.map(Number),
        };
        internshipDetailsFilter.durationUnit = "MONTHS";
        hasInternshipFilter = true;
      }
    }

    if (minStipend || maxStipend) {
      internshipDetailsFilter.stipendAmount = {};
      if (minStipend)
        internshipDetailsFilter.stipendAmount.gte = Number(minStipend);
      if (maxStipend)
        internshipDetailsFilter.stipendAmount.lte = Number(maxStipend);
      hasInternshipFilter = true;
    }

    if (stipendType) {
      internshipDetailsFilter.stipendType = stipendType
        .toString()
        .toUpperCase();
      hasInternshipFilter = true;
    }

    if (hasJobFilter || hasInternshipFilter) {
      const typeConditions = [];

      if (hasJobFilter) {
        typeConditions.push({
          opportunityType: "JOB",
          jobDetails: { is: jobDetailsFilter },
        });
      } else {
        typeConditions.push({ opportunityType: "JOB" });
      }

      if (hasInternshipFilter) {
        typeConditions.push({
          opportunityType: "INTERNSHIP",
          internshipDetails: { is: internshipDetailsFilter },
        });
      } else {
        typeConditions.push({ opportunityType: "INTERNSHIP" });
      }

      if (query.OR) {
        query.AND = [{ OR: query.OR }, { OR: typeConditions }];
        delete query.OR;
      } else {
        query.OR = typeConditions;
      }
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      prisma.baseListing.findMany({
        where: query,
        orderBy: { createdAt: "desc" },
        include: {
          postedBy: { select: { id: true, firstName: true, lastName: true } },
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              locations: { select: { city: true, state: true, country: true } },
              industry: true,
            },
          },
          jobDetails: true,
          internshipDetails: true,
        },
        skip,
        take: limit,
      }),
      prisma.baseListing.count({ where: query }),
    ]);

    let formattedListings = listings.map((listing) => {
      return {
        _id: listing.id, // Included for backward compatibility just in case
        ...listing,
        listingType: listing.opportunityType === "JOB" ? "job" : "internship",
      };
    });

    if (req.user && req.user.role === "USER" && !req.user.isEmployer) {
      const listingIds = listings.map((listing) => listing.id);

      const applications = await prisma.application.findMany({
        where: {
          jobSeekerId: req.user.id,
          listingId: { in: listingIds },
        },
      });

      const appliedListingIds = new Set(
        applications.map((app) => app.listingId),
      );

      formattedListings = formattedListings.map((listing) => ({
        ...listing,
        hasApplied: appliedListingIds.has(listing.id),
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
