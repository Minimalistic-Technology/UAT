import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import CashfreeService from "../services/cashfree.service.js";
import {
  emailRefundProcessed,
  emailSubscriptionActivated,
  emailSubscriptionCancelled,
  emailSubscriptionExpired,
} from "../utils/transactionalEmails.js";

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
      const payment = await prisma.payment.findFirst({
        where: {
          OR: [
            { cashfreeOrderId: subscription.orderId },
            { razorpayOrderId: subscription.orderId },
          ],
        },
      });

      if (!payment) {
        throw new ApiError(404, "Payment record not found, please contact support");
      }

      if (payment.gateway !== "CASHFREE" || !payment.cashfreeOrderId) {
        throw new ApiError(
          400,
          "This subscription was paid via a legacy gateway. Please contact support for a refund.",
        );
      }

      // payment.amount is stored in paise; Cashfree refunds are in rupees
      const refundAmountPaise = Math.round(payment.amount * 0.5);
      const refundAmountRupees = Number((refundAmountPaise / 100).toFixed(2));

      try {
        const refund = await CashfreeService.createRefund(payment.cashfreeOrderId, {
          refundAmount: refundAmountRupees,
          refundId: `ref_${payment.id}`,
          note: "Subscription cancellation 50% refund",
        });

        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "REFUNDED" },
        });

        const refundStatus =
          refund.refundStatus === "SUCCESS" ? "PROCESSED" : "PENDING";

        await prisma.refund.create({
          data: {
            paymentId: payment.id,
            cashfreeRefundId: refund.cfRefundId,
            amount: refundAmountPaise,
            status: refundStatus,
          },
        });

        emailRefundProcessed({
          ownerEmail: req.user?.email,
          ownerFirstName: req.user?.firstName,
          amountMinor: refundAmountPaise,
          currency: payment.currency,
          paymentId: payment.id,
          status: refundStatus,
        });

        refundProcessed = true;
      } catch (refundError) {
        console.error("Cashfree Refund Error:", refundError);
        throw new ApiError(500, "Failed to process refund from payment gateway");
      }
    }

    const updatedSub = await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "CANCELLED" }
    });

    const cancelledPlan = await prisma.plan.findUnique({
      where: { id: subscription.planId },
      select: { name: true },
    });

    emailSubscriptionCancelled({
      ownerEmail: req.user?.email,
      ownerFirstName: req.user?.firstName,
      planName: cancelledPlan?.name || "your",
      subscriptionId: subscription.id,
      refundInitiated: refundProcessed,
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

    const owner = await prisma.user.findUnique({
      where: { id: company.ownerId },
      select: { email: true, firstName: true },
    });

    emailSubscriptionActivated({
      ownerEmail: owner?.email,
      ownerFirstName: owner?.firstName,
      planName: plan.name,
      subscriptionId: subscription.id,
      postsGranted: plan.maxActiveJobPosts,
      expiryDate,
      currency: plan.currency ?? "INR",
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

    const newStatus = status.toUpperCase();
    const updatedSub = await prisma.subscription.update({
      where: { id: id as string },
      data: { status: newStatus as any }
    });

    if (
      subscription.status !== newStatus &&
      (newStatus === "CANCELLED" || newStatus === "EXPIRED")
    ) {
      const [company, plan] = await Promise.all([
        prisma.company.findUnique({
          where: { id: subscription.companyId },
          select: { owner: { select: { email: true, firstName: true } } },
        }),
        prisma.plan.findUnique({
          where: { id: subscription.planId },
          select: { name: true },
        }),
      ]);

      const emailArgs = {
        ownerEmail: company?.owner?.email,
        ownerFirstName: company?.owner?.firstName,
        planName: plan?.name || "your",
        subscriptionId: subscription.id,
      };

      if (newStatus === "EXPIRED") {
        emailSubscriptionExpired(emailArgs);
      } else {
        emailSubscriptionCancelled(emailArgs);
      }
    }

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
