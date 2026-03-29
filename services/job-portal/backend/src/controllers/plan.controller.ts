import { Request, Response, NextFunction } from "express";
import Plan from "../models/Plan.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";

export const createPlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      name,
      description,
      price,
      currency,
      durationDays,
      jobPostLimit,
      isFeatured,
      isDefault,
      displayOrder,
      features,
      isActive,
    } = req.body;

    // If making this the default plan, remove default status from others
    if (isDefault) {
      await Plan.updateMany({}, { isDefault: false });
    }

    const plan = await Plan.create({
      name,
      description,
      price,
      currency: currency || "INR",
      durationDays,
      jobPostLimit,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      isDefault: isDefault !== undefined ? isDefault : false,
      displayOrder: displayOrder !== undefined ? displayOrder : 0,
      features: features || [],
      isActive: isActive !== undefined ? isActive : true,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, plan, "Plan created successfully"));
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new ApiError(400, "A plan with this name already exists."));
    }
    next(new ApiError(500, error.message ?? "Server Error"));
  }
};

export const getPlans = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ displayOrder: 1 });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { count: plans.length, plans },
          "Active plans fetched successfully",
        ),
      );
  } catch (error: any) {
    next(error);
  }
};

export const getAllAdminPlans = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const plans = await Plan.find().sort({ displayOrder: 1, createdAt: -1 });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { count: plans.length, plans },
          "All plans fetched successfully for admin",
        ),
      );
  } catch (error: any) {
    next(error);
  }
};

export const updatePlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid plan ID"));
    }

    // If making this the default plan, remove default status from others
    if (req.body.isDefault) {
      await Plan.updateMany({ _id: { $ne: id } }, { isDefault: false });
    }

    const plan = await Plan.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      return next(new ApiError(404, "Plan not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, plan, "Plan updated successfully"));
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new ApiError(400, "A plan with this name already exists."));
    }
    next(error);
  }
};

export const deletePlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid plan ID"));
    }

    const plan = await Plan.findByIdAndDelete(id);

    if (!plan) {
      return next(new ApiError(404, "Plan not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Plan deleted successfully"));
  } catch (error: any) {
    next(error);
  }
};
