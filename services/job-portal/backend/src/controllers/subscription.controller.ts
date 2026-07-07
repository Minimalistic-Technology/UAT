import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import razorpay from "../config/razorpay.js";

export const getMyActiveSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const member = await prisma.companyMember.findFirst({
      where: { userId: req.user.id }
    });

    if (!member) {
      throw new ApiError(404, "Company member not found");
    }

    const isAuthorized = await prisma.companyMember.findFirst({
      where: {
        companyId: member.companyId,
        userId: req.user.id,
        role: { in: ["OWNER", "HR"] },
      }
    });

    if (!isAuthorized) {
      throw new ApiError(403, "You are not authorized to view this subscription");
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        companyId: member.companyId,
        status: "ACTIVE",
        expiryDate: { gt: new Date() },
      },
      include: {
        plan: {
          select: { name: true, currency: true, price: true, maxActiveJobPosts: true, subscriptionDurationDays: true }
        }
      }
    });

    if (!subscription) {
      return res.status(200).json(new ApiResponse(200, null, "You don't have any active subscription"));
    }

    res.status(200).json(new ApiResponse(200, subscription, "Active subscription fetched successfully"));
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
    const member = await prisma.companyMember.findFirst({
      where: { userId: req.user.id }
    });

    if (!member) {
      throw new ApiError(404, "Company member not found");
    }

    const isAuthorized = await prisma.companyMember.findFirst({
      where: {
        companyId: member.companyId,
        userId: req.user.id,
        role: { in: ["OWNER", "HR"] },
      }
    });

    if (!isAuthorized) {
      throw new ApiError(403, "You are not authorized to view the history of this subscription");
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { companyId: member.companyId },
      include: {
        plan: {
          select: { name: true, currency: true, price: true, maxActiveJobPosts: true, subscriptionDurationDays: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    if (!subscriptions.length) {
      return res.status(200).json(new ApiResponse(200, null, "You didn't buy any subscription yet"));
    }

    res.status(200).json(new ApiResponse(200, subscriptions, "Subscription history fetched successfully"));
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
    const member = await prisma.companyMember.findFirst({
      where: { userId: req.user.id }
    });

    if (!member) {
      throw new ApiError(404, "Company member not found");
    }

    const isAuthorized = await prisma.companyMember.findFirst({
      where: {
        companyId: member.companyId,
        userId: req.user.id,
        role: "OWNER",
      }
    });

    if (!isAuthorized) {
      throw new ApiError(403, "You are not authorized to cancel this subscription");
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId as string,
        company: { ownerId: req.user.id },
        status: "ACTIVE"
      }
    });

    if (!subscription) {
      throw new ApiError(404, "You don't have any active subscription");
    }

    const postsUsed = subscription.totalPostsGranted - subscription.postsRemaining;

    let refundProcessed = false;
    if (postsUsed === 0 && subscription.orderId) {
      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId: subscription.orderId }
      });

      if (!payment) {
        throw new ApiError(404, "Payment record not found, please contact support");
      }

      if (!payment.razorpayPaymentId) {
        throw new ApiError(400, "Payment ID missing, please contact support");
      }

      const refundAmount = Math.round(payment.amount * 0.5);
      try {
        const refundObj = await razorpay.payments.refund(payment.razorpayPaymentId, {
          amount: refundAmount,
          speed: "optimum",
        });

        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "REFUNDED" }
        });
        
        await prisma.refund.create({
          data: {
             paymentId: payment.id,
             razorpayRefundId: refundObj.id,
             amount: refundAmount,
             status: "PROCESSED"
          }
        });

        refundProcessed = true;
      } catch (razorpayError) {
        console.error("Razorpay Refund Error:", razorpayError);
        throw new ApiError(500, "Failed to process refund from payment gateway");
      }
    }

    const updatedSub = await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "CANCELLED" }
    });

    res.status(200).json(
      new ApiResponse(
        200,
        updatedSub,
        refundProcessed
          ? "Subscription cancelled and 50% refund initiated successfully"
          : "Subscription cancelled successfully",
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getAllSubscriptions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (req.query.status) {
      where.status = (req.query.status as string).toUpperCase();
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        company: {
          select: {
            name: true,
            logo: true,
            owner: { select: { firstName: true, lastName: true, email: true } }
          }
        },
        plan: {
          select: { name: true, price: true }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    });

    const total = await prisma.subscription.count({ where });

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
      )
    );
  } catch (error) {
    next(error);
  }
};

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

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new ApiError(404, "Company not found");
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      throw new ApiError(404, "Plan not found");
    }

    const durationMilliseconds = plan.subscriptionDurationDays * 24 * 60 * 60 * 1000;
    const expiryDate = new Date(Date.now() + durationMilliseconds);

    await prisma.subscription.updateMany({
      where: { companyId, status: "ACTIVE" },
      data: { status: "CANCELLED" }
    });

    const subscription = await prisma.subscription.create({
      data: {
        companyId,
        planId,
        postsRemaining: plan.maxActiveJobPosts,
        totalPostsGranted: plan.maxActiveJobPosts,
        startDate: new Date(),
        expiryDate,
        status: "ACTIVE",
      }
    });

    res.status(201).json(
      new ApiResponse(
        201,
        subscription,
        "Subscription manually assigned successfully",
      )
    );
  } catch (error) {
    next(error);
  }
};

export const updateSubscriptionStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["ACTIVE", "EXPIRED", "DEPLETED", "CANCELLED"];
    if (!validStatuses.includes(status.toUpperCase())) {
      throw new ApiError(400, "Invalid status provided");
    }

    const subscription = await prisma.subscription.findUnique({ where: { id: id as string } });
    if (!subscription) {
      throw new ApiError(404, "Subscription not found");
    }

    const updatedSub = await prisma.subscription.update({
      where: { id: id as string },
      data: { status: status.toUpperCase() as any }
    });

    res.status(200).json(
      new ApiResponse(
        200,
        updatedSub,
        "Subscription status updated successfully",
      )
    );
  } catch (error) {
    next(error);
  }
};
