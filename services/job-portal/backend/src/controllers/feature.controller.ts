import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import Feature, { FeatureStatus } from "../models/Feature.model.js";
import FeaturePermission from "../models/FeaturePermission.model.js";
import { IUser } from "../models/User.model.js";

interface CustomRequest extends Request {
    user?: IUser;
}

export const checkFeature = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const user = req.user;

        const feature = await Feature.findOne({ slug });

        if (!feature) {
            return res.status(200).json(new ApiResponse(200, { allowed: false }, "Feature not found"));
        }

        if (feature.status === FeatureStatus.PUBLIC) {
            return res.status(200).json(new ApiResponse(200, { allowed: true }, "Feature is public"));
        }

        if (feature.status === FeatureStatus.DISABLED) {
            return res.status(200).json(new ApiResponse(200, { allowed: false }, "Feature is disabled"));
        }

        if (feature.status === FeatureStatus.BETA) {
            if (!user) {
                return res.status(200).json(new ApiResponse(200, { allowed: false }, "User not authenticated for beta feature"));
            }

            const query: any = { feature: feature._id };
            const orConditions: any[] = [{ user: user._id }];

            if (user.company) {
                orConditions.push({ company: user.company });
            }

            query.$or = orConditions;

            const permission = await FeaturePermission.findOne(query);

            if (permission) {
                return res.status(200).json(new ApiResponse(200, { allowed: true }, "User/Company has beta permission"));
            }

            return res.status(200).json(new ApiResponse(200, { allowed: false }, "User does not have beta permission"));
        }

        return res.status(200).json(new ApiResponse(200, { allowed: false }, "Unknown status"));
    } catch (error) {
        next(error);
    }
};
