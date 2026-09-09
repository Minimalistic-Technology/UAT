import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import CashfreeService from "../services/cashfree.service.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { config } from "../config/env.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  emailPaymentFailed,
  emailSubscriptionActivated,
} from "../utils/transactionalEmails.js";

// Helper to provision subscription
const provisionSubscription = async (
  userId: string,
  planId: string,
  orderId: string,
  billingCycle: string = "monthly",
) => {
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) {
    return;
  }

  const companyMember = await prisma.companyMember.findFirst({
    where: {
      userId,
      role: { in: ["OWNER", "HR"] },
    },
  });

  if (!companyMember) {
    return;
  }

  const companyId = companyMember.companyId;

  // Cancel existing active subscriptions for this user's company
  await prisma.subscription.updateMany({
    where: { companyId, status: "ACTIVE" },
    data: { status: "CANCELLED" },
  });

  const durationMultiplier = billingCycle === "yearly" ? 12 : 1;
  const durationMilliseconds =
    plan.subscriptionDurationDays * durationMultiplier * 24 * 60 * 60 * 1000;
  const expiryDate = new Date(Date.now() + durationMilliseconds);

  const subscription = await prisma.subscription.create({
    data: {
      companyId,
      planId,
      postsRemaining: plan.maxActiveJobPosts,
      totalPostsGranted: plan.maxActiveJobPosts,
      startDate: new Date(),
      expiryDate,
      status: "ACTIVE",
      orderId,
    },
  });

  // Notify the purchaser that their plan is live — fire-and-forget.
  const [buyer, payment] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.payment.findFirst({ where: { cashfreeOrderId: orderId } }),
  ]);

  emailSubscriptionActivated({
    ownerEmail: buyer?.email,
    ownerFirstName: buyer?.firstName,
    planName: plan.name,
    subscriptionId: subscription.id,
    postsGranted: plan.maxActiveJobPosts,
    expiryDate,
    amountMinor: payment?.amount ?? null,
    currency: payment?.currency ?? plan.currency ?? "INR",
  });
};

/**
 * Applies a terminal Cashfree payment outcome to our Payment record.
 *
 * Idempotent: repeated calls (webhook retries racing the return-url verification)
 * are safe — the finalize / provision steps only run on the first transition into
 * a terminal state.
 */
const applyCashfreePaymentStatus = async (
  cashfreeOrderId: string,
  outcome: "PAID" | "FAILED",
  cfPaymentId?: string,
  failureReason?: string,
) => {
  const payment = await prisma.payment.findUnique({
    where: { cashfreeOrderId },
  });
  if (!payment) return null;

  // Already settled — nothing to do
  if (
    payment.status === "CAPTURED" ||
    payment.status === "FAILED" ||
    payment.status === "REFUNDED"
  ) {
    return payment;
  }

  const metadata = (payment.metadata as any) || {};

  if (outcome === "PAID") {
    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "CAPTURED",
        capturedAt: new Date(),
        cfPaymentId: cfPaymentId || payment.cfPaymentId,
        cfOrderStatus: "PAID",
      },
    });

    const existingSub = await prisma.subscription.findFirst({
      where: { orderId: cashfreeOrderId },
    });

    if (!existingSub && metadata.planId) {
      await provisionSubscription(
        payment.userId,
        metadata.planId,
        cashfreeOrderId,
        metadata.billingCycle,
      );
    }

    return updated;
  }

  const failed = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "FAILED",
      failureReason: failureReason || "Payment was not completed",
      cfOrderStatus: "FAILED",
      cfPaymentId: cfPaymentId || payment.cfPaymentId,
    },
  });

  const buyer = await prisma.user.findUnique({ where: { id: failed.userId } });
  const plan = metadata.planId
    ? await prisma.plan.findUnique({ where: { id: metadata.planId } })
    : null;

  emailPaymentFailed({
    userEmail: buyer?.email,
    userFirstName: buyer?.firstName,
    planName: plan?.name,
    orderId: cashfreeOrderId,
    reason: failureReason,
  });

  return failed;
};

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { planId, userId, couponCode, internalOrderId, billingCycle } =
      req.body;

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new ApiError(404, "Plan not found");

    const companyMember = await prisma.companyMember.findFirst({
      where: {
        userId,
        role: { in: ["OWNER", "HR"] },
      },
    });

    if (!companyMember) {
      throw new ApiError(
        400,
        "You must be part of a company to purchase a plan.",
      );
    }

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        companyId: companyMember.companyId,
        status: "ACTIVE",
        expiryDate: { gt: new Date() },
        OR: [{ postsRemaining: { gt: 0 } }, { postsRemaining: -1 }],
      },
    });

    if (activeSubscription) {
      throw new ApiError(
        400,
        "You already have an active plan with remaining job posts. Please use them before purchasing a new plan.",
      );
    }

    if (plan.price === 0) {
      const existingFreeSub = await prisma.subscription.findFirst({
        where: {
          companyId: companyMember.companyId,
          planId: plan.id,
        },
      });

      if (existingFreeSub) {
        throw new ApiError(400, "You have already claimed this free plan.");
      }
    }

    // Base pricing based on cycle
    let basePlanPrice = plan.price;
    if (billingCycle === "yearly") {
      basePlanPrice = Math.round(plan.price * 12 * 0.8);
    }

    let finalAmount = basePlanPrice;
    let discountValue = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode.toUpperCase(),
          isActive: true,
          usages: { none: { userId } },
          OR: [{ expiryDate: { gt: new Date() } }, { expiryDate: null }],
        },
      });

      if (!coupon) {
        throw new ApiError(
          400,
          "Coupon is invalid, expired, or has already been used by you",
        );
      }

      if (
        coupon.maxUses &&
        coupon.maxUses !== -1 &&
        coupon.usageCount >= coupon.maxUses
      ) {
        throw new ApiError(400, "Coupon has reached its maximum usage limit");
      }

      // Calculate Discount
      if (coupon.type === "PERCENTAGE") {
        discountValue = Number(
          ((basePlanPrice * coupon.value) / 100).toFixed(2),
        );
      } else {
        discountValue = coupon.value;
      }

      // Cap discount at plan price
      discountValue = Math.min(discountValue, basePlanPrice);

      try {
        appliedCoupon = await prisma.coupon.update({
          where: {
            id: coupon.id,
            ...(coupon.maxUses && coupon.maxUses !== -1
              ? { usageCount: { lt: coupon.maxUses } }
              : {}),
          },
          data: {
            usageCount: { increment: 1 },
            usages: {
              create: {
                userId,
                discountApplied: discountValue,
              },
            },
          },
        });
      } catch (error: any) {
        if (error.code === "P2025") {
          throw new ApiError(
            400,
            "Coupon has reached its maximum usage limit or is no longer available",
          );
        }
        if (error.code === "P2002") {
          throw new ApiError(400, "Coupon has already been used by you");
        }
        throw new ApiError(400, "Failed to apply coupon. Please try again.");
      }

      finalAmount = Number((basePlanPrice - discountValue).toFixed(2));
    }

    const currency = plan.currency || "INR";

    // Handle free plan or 100% discount — no gateway involved
    if (finalAmount === 0) {
      const internalOrderIdString = internalOrderId || `FREE_${Date.now()}`;

      await prisma.payment.create({
        data: {
          userId,
          amount: 0,
          currency,
          gateway: "CASHFREE",
          cashfreeOrderId: internalOrderIdString,
          metadata: {
            planId,
            couponCode: appliedCoupon?.code,
            internalOrderId,
            billingCycle: billingCycle || "monthly",
          },
          status: "CAPTURED",
          capturedAt: new Date(),
        },
      });

      await provisionSubscription(
        userId,
        planId,
        internalOrderIdString,
        billingCycle,
      );

      return res.status(201).json(
        new ApiResponse(
          201,
          {
            order: { id: internalOrderIdString, amount: 0, currency },
            finalAmount,
            discountValue,
            couponApplied: !!appliedCoupon,
            isFree: true,
          },
          "Free order processed successfully",
        ),
      );
    }

    // Paid path — create our Payment row first, then the Cashfree order
    const amountInPaise = Math.round(finalAmount * 100);

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: amountInPaise,
        currency,
        gateway: "CASHFREE",
        metadata: {
          planId,
          couponCode: appliedCoupon?.code,
          internalOrderId,
          billingCycle: billingCycle || "monthly",
        },
        status: "CREATED",
      },
    });

    const cashfreeOrderId = `jp_${payment.id}`;

    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });

      const returnUrl = `${config.clientUrl.replace(/\/$/, "")}/employer-dashboard/billing/payment-status?order_id=${cashfreeOrderId}`;

      const cfResult = await CashfreeService.createOrder({
        orderId: cashfreeOrderId,
        amount: finalAmount, // rupees
        customerId: userId,
        customerName:
          `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Employer",
        customerEmail: user?.email || "",
        customerPhone: user?.phone || "9999999999",
        returnUrl,
      });

      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          cashfreeOrderId,
          paymentSessionId: cfResult.paymentSessionId,
          cfOrderStatus: cfResult.orderStatus,
        },
      });

      return res.status(201).json(
        new ApiResponse(
          201,
          {
            order: { id: cashfreeOrderId, amount: amountInPaise, currency },
            paymentSessionId: updatedPayment.paymentSessionId,
            finalAmount,
            discountValue,
            couponApplied: !!appliedCoupon,
          },
          "Order created successfully",
        ),
      );
    } catch (cfError: any) {
      // Roll back so the user can retry cleanly
      await prisma.payment.delete({ where: { id: payment.id } }).catch(() => {});

      if (appliedCoupon) {
        await prisma.coupon
          .update({
            where: { id: appliedCoupon.id },
            data: { usageCount: { decrement: 1 } },
          })
          .catch(() => {});
        await prisma.couponUsage
          .delete({
            where: { couponId_userId: { couponId: appliedCoupon.id, userId } },
          })
          .catch(() => {});
      }

      console.error(
        "[CASHFREE-ERROR] Failed to create Cashfree order:",
        cfError?.data || cfError?.message || cfError,
      );
      throw new ApiError(
        502,
        "Failed to initiate payment. Please try again in a moment.",
      );
    }
  } catch (error: any) {
    next(error);
  }
};

/**
 * Cashfree server-to-server webhook. No auth — verified via HMAC signature.
 * Mounted with `express.raw({ type: "application/json" })`, so `req.body` is a Buffer.
 */
export const handleCashfreeWebhook = async (
  req: Request,
  res: Response,
) => {
  try {
    const signature = (req.headers["x-webhook-signature"] as string) || "";
    const timestamp = (req.headers["x-webhook-timestamp"] as string) || "";
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body);

    if (!CashfreeService.verifyWebhookSignature(signature, rawBody, timestamp)) {
      console.warn("[CASHFREE-WEBHOOK] Invalid signature");
      return res.status(401).json(new ApiResponse(401, null, "Invalid signature"));
    }

    const payload = JSON.parse(rawBody);
    const { type, data } = payload;
    const orderId: string | undefined = data?.order?.order_id;
    const cfPaymentId: string | undefined =
      data?.payment?.cf_payment_id != null
        ? String(data.payment.cf_payment_id)
        : undefined;

    if (!orderId) {
      return res.status(200).json(new ApiResponse(200, null, "Ignored"));
    }

    // Idempotency — one synthetic event id per (order, event type)
    const eventId = `cf_${orderId}_${type}`;
    const existingEvent = await prisma.paymentWebhookEvent.findUnique({
      where: { eventId },
    });
    if (existingEvent) {
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Already processed"));
    }

    const payment = await prisma.payment.findUnique({
      where: { cashfreeOrderId: orderId },
    });

    if (type === "PAYMENT_SUCCESS_WEBHOOK") {
      await applyCashfreePaymentStatus(orderId, "PAID", cfPaymentId);
    } else if (
      type === "PAYMENT_FAILED_WEBHOOK" ||
      type === "PAYMENT_USER_DROPPED_WEBHOOK"
    ) {
      await applyCashfreePaymentStatus(
        orderId,
        "FAILED",
        cfPaymentId,
        data?.payment?.payment_message ||
          data?.error_details?.error_description,
      );
    }

    await prisma.paymentWebhookEvent
      .create({
        data: {
          eventId,
          type: type || "UNKNOWN",
          payload,
          paymentId: payment?.id,
          processedAt: new Date(),
        },
      })
      .catch((err: any) => {
        if (err?.code !== "P2002") throw err; // ignore idempotent race
      });

    return res.status(200).json(new ApiResponse(200, null, "Processed"));
  } catch (error) {
    console.error("[CASHFREE-WEBHOOK-ERROR]", error);
    // 500 → Cashfree retries
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Webhook processing failed"));
  }
};

/**
 * Called by the frontend payment-status page after the browser returns from
 * Cashfree hosted checkout. Fetches authoritative status directly from Cashfree.
 */
export const verifyCashfreePayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orderId = String(req.params.orderId);

    const payment = await prisma.payment.findUnique({
      where: { cashfreeOrderId: orderId },
    });

    if (!payment) {
      throw new ApiError(404, "Payment record not found");
    }

    if (payment.userId !== req.user?.id) {
      throw new ApiError(403, "You are not authorized to view this payment");
    }

    const cfOrder = await CashfreeService.fetchOrder(orderId as string);
    const orderStatus: string = cfOrder.order_status;

    let updated = payment;
    if (orderStatus === "PAID") {
      updated = (await applyCashfreePaymentStatus(orderId as string, "PAID")) || payment;
    } else if (orderStatus === "EXPIRED" || orderStatus === "TERMINATED") {
      updated =
        (await applyCashfreePaymentStatus(
          orderId as string,
          "FAILED",
          undefined,
          "Payment was not completed",
        )) || payment;
    }

    res.status(200).json(
      new ApiResponse(
        200,
        {
          orderId,
          orderStatus,
          paymentStatus: updated.status,
        },
        "Payment status fetched",
      ),
    );
  } catch (error) {
    next(error);
  }
};

export const getMyPayments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res
      .status(200)
      .json(new ApiResponse(200, payments, "Payments retrieved successfully"));
  } catch (error) {
    next(error);
  }
};
