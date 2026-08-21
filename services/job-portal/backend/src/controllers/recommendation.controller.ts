import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { getRecommendedListings } from "../services/recommendation.service.js";

export const getRecommendedJobs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const typeParam = req.query.type ? String(req.query.type).toUpperCase() : undefined;
    const opportunityType =
      typeParam === "JOB" || typeParam === "INTERNSHIP" ? typeParam : undefined;

    const recommendations = await getRecommendedListings(req.user.id, {
      limit,
      opportunityType,
    });

    const jobs = recommendations.map((listing: any) => ({
      _id: listing.id, // kept for the shared listing-card components
      ...listing,
      listingType: listing.opportunityType === "JOB" ? "job" : "internship",
    }));

    return res.status(200).json(
      new ApiResponse(
        200,
        { jobs, count: jobs.length },
        "Recommended jobs fetched successfully",
      ),
    );
  } catch (error: any) {
    next(error);
  }
};
