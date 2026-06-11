import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

// Import all models to ensure Mongoose knows about them when fetching collections
import "../models/User.model.js";
import "../models/Company.model.js";
import "../models/Job.model.js";
import "../models/Internship.model.js";
import "../models/Application.model.js";
import "../models/CompanyMember.model.js";
import "../models/KYC.model.js";
import "../models/Subscription.model.js";
import "../models/Plan.model.js";
import "../models/Coupon.model.js";
import "../models/Feature.model.js";
import "../models/FeaturePermission.model.js";
import "../models/TempUser.model.js";

export const getCollections = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const models = Object.keys(mongoose.models);
        res.status(200).json(new ApiResponse(200, models, "All collections fetched successfully"));
    } catch (error) {
        next(error);
    }
};

export const runQuery = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { collectionName, operation, query, updateData } = req.body;

        if (!collectionName || !mongoose.models[collectionName]) {
            throw new ApiError(400, `Collection '${collectionName}' not found in database.`);
        }

        const Model = mongoose.models[collectionName];
        let result;

        const parseJsonSafely = (data: any) => {
            if (!data) return {};
            if (typeof data === "object") return data;
            try {
                return JSON.parse(data);
            } catch (e) {
                throw new ApiError(400, "Invalid JSON format in query or data");
            }
        };

        const parsedQuery = parseJsonSafely(query);
        const parsedUpdateData = parseJsonSafely(updateData);

        switch (operation) {
            case "find":
                // Limit to 500 to prevent breaking the browser
                result = await Model.find(parsedQuery).limit(500).sort({ createdAt: -1 });
                break;
            case "findOne":
                result = await Model.findOne(parsedQuery);
                break;
            case "updateOne":
                result = await Model.updateOne(parsedQuery, parsedUpdateData);
                break;
            case "updateMany":
                result = await Model.updateMany(parsedQuery, parsedUpdateData);
                break;
            case "deleteMany":
                result = await Model.deleteMany(parsedQuery);
                break;
            case "deleteOne":
                result = await Model.deleteOne(parsedQuery);
                break;
            case "create":
                result = await Model.create(parsedUpdateData);
                break;
            default:
                throw new ApiError(400, "Invalid Database Operation Provided");
        }

        res.status(200).json(new ApiResponse(200, result, "Database Query executed successfully"));
    } catch (error) {
        next(error);
    }
};
