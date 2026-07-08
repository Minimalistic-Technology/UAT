import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import razorpay from "../config/razorpay.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import crypto from "crypto";
import { config } from "../config/env.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// Helper to provision subscription
const provisionSubscription = async (userId: string, planId: string, razorpayOrderId: string, billingCycle: string = "monthly") => {
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) {
    return;
  }

  const companyMember = await prisma.companyMember.findFirst({
    where: {
      userId,
      role: { in: ["OWNER", "HR"] },
    }
  });

  if (!companyMember) {
    return;
  }

  const companyId = companyMember.companyId;

  // Cancel existing active subscriptions for this user's company
  await prisma.subscription.updateMany({
    where: { companyId, status: "ACTIVE" },
    data: { status: "CANCELLED" }
  });

  const durationMultiplier = billingCycle === "yearly" ? 12 : 1;
  const durationMilliseconds = (plan.subscriptionDurationDays * durationMultiplier) * 24 * 60 * 60 * 1000;
  const expiryDate = new Date(Date.now() + durationMilliseconds);

  await prisma.subscription.create({
    data: {
      companyId,
      planId,
      postsRemaining: plan.maxActiveJobPosts,
      totalPostsGranted: plan.maxActiveJobPosts,
      startDate: new Date(),
      expiryDate,
      status: "ACTIVE",
      orderId: razorpayOrderId,
    }
  });
};

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { planId, userId, couponCode, internalOrderId, billingCycle } = req.body;

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new ApiError(404, "Plan not found");

    const companyMember = await prisma.companyMember.findFirst({
      where: {
        userId,
        role: { in: ["OWNER", "HR"] },
      }
    });

    if (!companyMember) {
      throw new ApiError(400, "You must be part of a company to purchase a plan.");
    }

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        companyId: companyMember.companyId,
        status: "ACTIVE",
        expiryDate: { gt: new Date() },
        OR: [{ postsRemaining: { gt: 0 } }, { postsRemaining: -1 }],
      }
    });

    if (activeSubscription) {
      throw new ApiError(400, "You already have an active plan with remaining job posts. Please use them before purchasing a new plan.");
    }

    if (plan.price === 0) {
      const existingFreeSub = await prisma.subscription.findFirst({
        where: {
          companyId: companyMember.companyId,
          planId: plan.id,
        }
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
      appliedCoupon = await prisma.$transaction(async (tx) => {
        const coupon = await tx.coupon.findFirst({
          where: {
            code: couponCode.toUpperCase(),
            isActive: true,
            usages: { none: { userId } },
            OR: [
              { expiryDate: { gt: new Date() } },
              { expiryDate: null },
            ],
          },
        });

        if (!coupon) return null;
        if (coupon.maxUses && coupon.maxUses !== -1 && coupon.usageCount >= coupon.maxUses) return null;

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

        const updatedCoupon = await tx.coupon.update({
          where: { id: coupon.id },
          data: {
            usageCount: { increment: 1 },
            usages: {
              create: {
                userId,
                discountApplied: discountValue
              }
            }
          }
        });

        return updatedCoupon;
      });

      if (!appliedCoupon) {
        throw new ApiError(400, "Coupon is invalid, expired, or has already been used by you");
      }

      finalAmount = Number((basePlanPrice - discountValue).toFixed(2));
    }

    // Handle free plan or 100% discount
    if (finalAmount === 0) {
      const internalOrderIdString = internalOrderId || `FREE_${Date.now()}`;

      await prisma.payment.create({
        data: {
          userId,
          amount: 0,
          currency: plan.currency || "INR",
          razorpayOrderId: internalOrderIdString,
          metadata: { planId, couponCode: appliedCoupon?.code, internalOrderId, billingCycle: billingCycle || "monthly" },
          status: "CAPTURED",
          capturedAt: new Date(),
        }
      });

      await provisionSubscription(userId, planId, internalOrderIdString, billingCycle);

      return res.status(201).json(
        new ApiResponse(
          201,
          {
            order: { id: internalOrderIdString, amount: 0, currency: plan.currency || "INR" },
            finalAmount,
            discountValue,
            couponApplied: !!appliedCoupon,
            isFree: true
          },
          "Free order processed successfully",
        ),
      );
    }

    // 4. Create Razorpay Order
    const options = {
      amount: Math.round(finalAmount * 100),
      currency: plan.currency || "INR",
      receipt: internalOrderId,
      notes: {
        userId,
        planId,
        couponCode: couponCode || "NONE",
        billingCycle: billingCycle || "monthly"
      },
    };

    const order = await razorpay.orders.create(options);

    // 5. Create Payment Document
    await prisma.payment.create({
      data: {
        userId,
        amount: Math.round(finalAmount * 100),
        currency: plan.currency || "INR",
        razorpayOrderId: order.id,
        metadata: { planId, couponCode: appliedCoupon?.code, internalOrderId, billingCycle: billingCycle || "monthly" },
        status: "CREATED",
      }
    });

    res.status(201).json(
      new ApiResponse(
        201,
        {
          order,
          finalAmount,
          discountValue,
          couponApplied: !!appliedCoupon,
        },
        "Order created successfully",
      ),
    );
  } catch (error: any) {
    next(error);
  }
};

export const handleRazorpayWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const secret = config.razorpayWebhookSecret;
  const signature = req.headers["x-razorpay-signature"] as string;
  const eventId = req.headers["x-razorpay-event-id"] as string;

  try {
    /**
     * 1. Verify Signature (SECURE WAY)
     */
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(req.body); // Buffer
    const generatedSignature = hmac.digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(signature),
    );

    if (!isValid) {
      return next(new ApiError(400, "Invalid webhook signature"));
    }

    /**
     * 2. Parse Payload
     */
    const payload = JSON.parse(req.body.toString());
    const { event, payload: data } = payload;

    const paymentEntity = data?.payment?.entity;

    if (!paymentEntity) {
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Webhook ignored"));
    }

    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;

    /**
     * 3. Idempotency Check (IMPORTANT)
     */
    const existingEvent = await prisma.paymentWebhookEvent.findUnique({
      where: { eventId }
    });

    if (existingEvent) {
      return res.status(200).json(new ApiResponse(200, null, "Webhook already processed"));
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { razorpayOrderId }
    });

    /**
     * 5. Handle Events
     */
    switch (event) {
      case "payment.captured":
        await prisma.payment.update({
          where: { razorpayOrderId },
          data: {
            razorpayPaymentId,
            webhookEvents: {
              create: {
                eventId,
                type: event,
                payload: payload || {}
              }
            },
            status: "CAPTURED",
            capturedAt: new Date(),
            method: paymentEntity.method,
          }
        });

        // Provision subscription upon successful payment
        try {
          const { userId, planId, billingCycle } = paymentEntity.notes || {};

          // Check if subscription already exists for this order to prevent duplicate provisioning
          const existingSub = await prisma.subscription.findFirst({
            where: { orderId: razorpayOrderId }
          });
          if (!existingSub && userId && planId) {
            await provisionSubscription(userId, planId, razorpayOrderId, billingCycle);
          }
        } catch (subErr) {
          // Catch the error so we still return 200 to Razorpay
        }
        break;

      case "payment.failed":
        await prisma.payment.update({
          where: { razorpayOrderId },
          data: {
            razorpayPaymentId,
            webhookEvents: {
              create: {
                eventId,
                type: event,
                payload: payload || {}
              }
            },
            status: "FAILED",
            failureReason: paymentEntity.error_description,
          }
        });
        break;

      case "payment.authorized":
        await prisma.payment.update({
          where: { razorpayOrderId },
          data: {
            razorpayPaymentId,
            webhookEvents: {
              create: {
                eventId,
                type: event,
                payload: payload || {}
              }
            },
            status: "AUTHORIZED",
          }
        });
        break;

      default:
    }

    /**
     * 6. Always respond 200
     */
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Webhook processed successfully"));
  } catch (error) {
    /**
     * Important:
     * Return 500 → Razorpay retries
     */
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Webhook processing failed"));
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const secret = config.razorpayKeySecret;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(razorpay_signature),
    );

    if (!isValid) {
      return next(new ApiError(400, "Invalid payment signature"));
    }

    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id }
    });

    if (!payment) {
      return next(new ApiError(404, "Payment record not found"));
    }

    if (payment.status !== "CAPTURED") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "CAPTURED",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          capturedAt: new Date(),
        }
      });

      // Provision subscription
      if (payment.metadata && (payment.metadata as any).planId) {
        const metadata = payment.metadata as any;
        const planId = metadata.planId;
        const billingCycle = metadata.billingCycle || "monthly";
        await provisionSubscription(payment.userId, planId, razorpay_order_id, billingCycle);
      }
    }

    res.status(200).json(new ApiResponse(200, { success: true }, "Payment verified successfully"));
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

    res.status(200).json(new ApiResponse(200, payments, "Payments retrieved successfully"));
  } catch (error) {
    next(error);
  }
};
