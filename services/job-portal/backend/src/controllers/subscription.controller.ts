import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import Subscription from "../models/Subscription.model.js";
import Company from "../models/Company.model.js";
import Plan from "../models/Plan.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import CompanyMember, { CompanyRole } from "../models/CompanyMember.model.js";

export const getMyActiveSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const employerId = req.user.id;

    const company = await Company.findOne({ owner: employerId });

    if (!company) {
      throw new ApiError(404, "Company not found");
    }

    const isCompanyMember = await CompanyMember.findOne({
      companyId: company._id,
      userId: employerId,
    });

    if (!isCompanyMember) {
      throw new ApiError(403, "You are not a member of this company");
    }

    const subscription = await Subscription.findOne({
      employerId,
      status: "active",
      expiryDate: { $gt: new Date() },
    }).populate("planId");

    console.log(subscription)

    // If there's an active one but posts are depleted, isValid will be false, but the doc is returned.
    // We can just return it. The frontend handles showing "Depleted" or similar.

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscription,
          "Active subscription fetched successfully",
        ),
      );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get subscription history for an employer
 * @route   GET /api/subscriptions/history
 * @access  Private (Employer)
 */
export const getMySubscriptionHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const employerId = req.user?.id;

    const subscriptions = await Subscription.find({ employerId })
      .populate("planId")
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscriptions,
          "Subscription history fetched successfully",
        ),
      );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an active subscription (Employer)
 * @route   PATCH /api/subscriptions/:id/cancel
 * @access  Private (Employer)
 */
export const cancelMySubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const employerId = req.user?.id;
    const { id } = req.params;

    const subscription = await Subscription.findOne({ _id: id, employerId });

    if (!subscription) {
      throw new ApiError(404, "Subscription not found or unauthorized");
    }

    if (subscription.status !== "active") {
      throw new ApiError(
        400,
        `Cannot cancel a subscription that is ${subscription.status}`,
      );
    }

    subscription.status = "cancelled";
    await subscription.save();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscription,
          "Subscription cancelled successfully",
        ),
      );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all subscriptions across the platform
 * @route   GET /api/subscriptions
 * @access  Private (Super Admin)
 */
export const getAllSubscriptions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Basic pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (req.query.status) {
      query.status = req.query.status;
    }

    const subscriptions = await Subscription.find(query)
      .populate("employerId", "name email")
      .populate("companyId", "name logo")
      .populate("planId", "name price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Subscription.countDocuments(query);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          subscriptions,
          pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
          },
        },
        "All subscriptions fetched successfully",
      ),
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Manually assign a subscription to a company
 * @route   POST /api/subscriptions/admin/assign
 * @access  Private (Super Admin)
 */
export const adminAssignSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { companyId, planId } = req.body;

    if (!companyId || !planId) {
      throw new ApiError(400, "Both companyId and planId are required");
    }

    const company = await Company.findById(companyId);
    if (!company) {
      throw new ApiError(404, "Company not found");
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new ApiError(404, "Plan not found");
    }

    const durationMilliseconds = plan.durationDays * 24 * 60 * 60 * 1000;
    const expiryDate = new Date(Date.now() + durationMilliseconds);

    // Cancel any currently active subscriptions for this employer to avoid conflicts
    await Subscription.updateMany(
      { employerId: company.owner, status: "active" },
      { $set: { status: "cancelled" } },
    );

    const subscription = await Subscription.create({
      employerId: company.owner,
      companyId,
      planId,
      postsRemaining: plan.jobPostLimit,
      totalPostsGranted: plan.jobPostLimit,
      startDate: new Date(),
      expiryDate,
      status: "active",
    });

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          subscription,
          "Subscription manually assigned successfully",
        ),
      );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update subscription status manually
 * @route   PATCH /api/subscriptions/:id/status
 * @access  Private (Super Admin)
 */
export const updateSubscriptionStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "expired", "depleted", "cancelled"].includes(status)) {
      throw new ApiError(400, "Invalid status provided");
    }

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      throw new ApiError(404, "Subscription not found");
    }

    subscription.status = status;
    await subscription.save();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscription,
          "Subscription status updated successfully",
        ),
      );
  } catch (error) {
    next(error);
  }
};
