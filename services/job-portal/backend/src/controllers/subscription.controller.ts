import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import Subscription from "../models/Subscription.model.js";
import Company from "../models/Company.model.js";
import Plan from "../models/Plan.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import CompanyMember, { CompanyRole } from "../models/CompanyMember.model.js";
import Payment, { PaymentStatus } from "../models/Payment.model.js";
import razorpay from "../config/razorpay.js";

export const getMyActiveSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const member = await CompanyMember.findOne({ user: req.user.id });

    if (!member) {
      throw new ApiError(404, "Company member not found");
    }

    const isAuthorized = await CompanyMember.findOne({
      company: member.company,
      user: req.user.id,
      role: {
        $in: [CompanyRole.OWNER, CompanyRole.HR],
      },
    });

    if (!isAuthorized) {
      throw new ApiError(
        403,
        "You are not authorized to view this subscription",
      );
    }

    const subscription = await Subscription.findOne({
      companyId: member.company,
      status: "active",
      expiryDate: { $gt: new Date() },
    }).populate("planId", "name currency price jobPostLimit durationDays");

    if (!subscription) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, null, "You don't have any active subscription"),
        );
    }

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

export const getMySubscriptionHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const member = await CompanyMember.findOne({ user: req.user.id });

    if (!member) {
      throw new ApiError(404, "Company member not found");
    }

    const isAuthorized = await CompanyMember.findOne({
      company: member.company,
      user: req.user.id,
      role: {
        $in: [CompanyRole.OWNER, CompanyRole.HR],
      },
    });

    if (!isAuthorized) {
      throw new ApiError(
        403,
        "You are not authorized to view the history of this subscription",
      );
    }

    const subscriptions = await Subscription.find({ companyId: member.company })
      .populate("planId", "name currency price jobPostLimit durationDays")
      .sort({ createdAt: -1 });

    if (!subscriptions) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, null, "You didn't bought any subscription yet"),
        );
    }

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

export const cancelMySubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: subscriptionId } = req.params;
    const member = await CompanyMember.findOne({ user: req.user.id });

    if (!member) {
      throw new ApiError(404, "Company member not found");
    }

    const isAuthorized = await CompanyMember.findOne({
      company: member.company,
      user: req.user.id,
      role: CompanyRole.OWNER,
    });

    if (!isAuthorized) {
      throw new ApiError(
        403,
        "You are not authorized to cance; this subscription",
      );
    }

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      employerId: req.user.id,
      status: "active"
    });

    if (!subscription) {
      throw new ApiError(404, "You don't have any active subscription");
    }

    if (subscription.status !== "active") {
      throw new ApiError(
        400,
        `Cannot cancel a subscription that is ${subscription.status}`,
      );
    }

    const postsUsed =
      subscription.totalPostsGranted - subscription.postsRemaining;

    let refundProcessed = false;
    if (postsUsed === 0 && subscription.orderId) {
      // Find the corresponding payment to get razorpayPaymentId
      const payment = await Payment.findOne({
        razorpayOrderId: subscription.orderId,
      });

      if (!payment) {
        throw new ApiError(
          404,
          "Payment record not found, please contact support",
        );
      }

      if (!payment.razorpayPaymentId) {
        throw new ApiError(400, "Payment ID missing, please contact support");
      }

      if (payment && payment.razorpayPaymentId) {
        const refundAmount = Math.round(payment.amount * 0.5);
        try {
          await razorpay.payments.refund(payment.razorpayPaymentId, {
            amount: refundAmount, // Payment amount is in paise
            speed: "optimum",
          });

          // Mark payment as refunded locally
          payment.status = PaymentStatus.REFUNDED;
          payment.refundAmount = refundAmount;
          await payment.save();

          refundProcessed = true;
        } catch (razorpayError) {
          console.error("Razorpay Refund Error:", razorpayError);
          throw new ApiError(
            500,
            "Failed to process refund from payment gateway",
          );
        }
      }
    }

    subscription.status = "cancelled";
    await subscription.save();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscription,
          refundProcessed
            ? "Subscription cancelled and 50% refund initiated successfully"
            : "Subscription cancelled successfully",
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
