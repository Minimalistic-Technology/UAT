import { Request, Response, NextFunction } from "express";
import Plan from "../models/Plan.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
import Subscription from "../models/Subscription.model.js";
import { getPagination } from "../utils/parse-pagination.js";

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
      allowResumeDownload,
      postValidityDays,
    } = req.body;

    const existingPlan = await Plan.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") }, // Case-insensitive check
    });

    if (existingPlan) {
      return next(new ApiError(400, `A plan named "${name}" already exists.`));
    }

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
      allowResumeDownload,
      postValidityDays,
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


export const updatePlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      session.endSession();
      return next(new ApiError(400, "Invalid plan ID"));
    }

    const { isDefault, ...updateData } = req.body;

    let plan;

    if (isDefault === true) {
      await Plan.updateMany(
        { _id: { $ne: id } },
        { $set: { isDefault: false } },
        { session },
      );

      plan = await Plan.findByIdAndUpdate(
        id,
        { ...updateData, isDefault: true },
        {
          returnDocument: "after",
          runValidators: true,
          session,
        },
      );
    } else {
      plan = await Plan.findByIdAndUpdate(id, updateData, {
        returnDocument: "after",
        runValidators: true,
        session,
      });
    }

    if (!plan) {
      await session.abortTransaction();
      session.endSession();
      return next(new ApiError(404, "Plan not found"));
    }

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .json(new ApiResponse(200, plan, "Plan updated successfully"));
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    if (error.code === 11000) {
      return next(new ApiError(400, "A plan with this name already exists."));
    }

    return next(error);
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

    const plan = await Plan.findById(id);

    if (!plan) {
      return next(new ApiError(404, "Plan not found"));
    }

    // Default plan cannot be deleted
    if (plan.isDefault) {
      return next(new ApiError(400, "Default plan cannot be deleted"));
    }

    // Check if the plan is in use
    const isPlanInUse = await Subscription.exists({ plan: id });

    if (isPlanInUse) {
      // Soft delete instead
      plan.isActive = false;
      await plan.save();

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            plan,
            "Plan is in use. Marked as inactive instead of deleting.",
          ),
        );
    }

    await Plan.findByIdAndDelete(id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Plan deleted successfully"));
  } catch (error: any) {
    return next(error);
  }
};
