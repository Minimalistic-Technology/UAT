import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import { prisma } from "../lib/prisma.js";

interface CustomRequest extends Request {
  user?: any;
}

export const checkFeature = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.params;
    const user = req.user;

    const feature = await prisma.feature.findUnique({ where: { slug: String(slug) } });

    if (!feature) {
      return res
        .status(200)
        .json(new ApiResponse(200, { allowed: false }, "Feature not found"));
    } else if (feature.status === "PUBLIC") {
      return res
        .status(200)
        .json(new ApiResponse(200, { allowed: true }, "Feature is public"));
    } else if (feature.status === "DISABLED") {
      return res
        .status(200)
        .json(new ApiResponse(200, { allowed: false }, "Feature is disabled"));
    }

    if (feature.status === "BETA") {
      if (!user) {
        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              { allowed: false },
              "User not authenticated for beta feature",
            ),
          );
      }

      const orConditions: any[] = [{ userId: user.id }];

      if (user.companyId) {
        orConditions.push({ companyId: user.companyId });
      }

      const permission = await prisma.featurePermission.findFirst({
        where: {
          featureId: feature.id,
          OR: orConditions,
        },
      });

      if (permission) {
        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              { allowed: true },
              "User/Company has beta permission",
            ),
          );
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { allowed: false },
            "User does not have beta permission",
          ),
        );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { allowed: false }, "Unknown status"));
  } catch (error) {
    next(error);
  }
};
