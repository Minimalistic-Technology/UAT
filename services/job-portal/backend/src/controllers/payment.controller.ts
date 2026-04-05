import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import razorpay from "../config/razorpay.js";
import Payment, { PaymentStatus } from "../models/Payment.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import crypto from "crypto";
import { config } from "../config/env.js";
import Plan from "../models/Plan.model.js";
import Coupon from "../models/Coupon.model.js";

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { planId, userId, couponCode, internalOrderId } = req.body;

    // 1. Fetch the actual Plan from DB
    const plan = await Plan.findById(planId);
    if (!plan) throw new ApiError(404, "Plan not found");

    let finalAmount = plan.price;
    let discountValue = 0;
    let appliedCoupon = null;

    // 2. If a coupon is provided, validate and apply it
    if (couponCode) {
      appliedCoupon = await Coupon.findOneAndUpdate(
        {
          code: couponCode.toUpperCase(),
          isActive: true,
          $or: [
            { expiryDate: { $gt: new Date() } },
            { expiryDate: null },
            { expiryDate: { $exists: false } },
            { maxUses: { $exists: false } },
            { maxUses: null },
            { maxUses: -1 },
            { $expr: { $lt: ["$usageCount", "$maxUses"] } },
          ],
        },
        { $inc: { usageCount: 1 } },
        { new: true, session },
      );

      if (!appliedCoupon) {
        throw new ApiError(400, "Coupon is invalid or expired");
      }

      // Calculate Discount
      if (appliedCoupon.type === "percentage") {
        discountValue = Number(
          ((plan.price * appliedCoupon.value) / 100).toFixed(2),
        );
      } else {
        discountValue = appliedCoupon.value;
      }

      // Cap discount at plan price
      discountValue = Math.min(discountValue, plan.price);
      finalAmount = Number((plan.price - discountValue).toFixed(2));
    }

    // 3. Create Razorpay Order
    const options = {
      amount: Math.round(finalAmount * 100),
      currency: plan.currency || "INR",
      receipt: internalOrderId,
      notes: {
        userId,
        planId,
        couponCode: couponCode || "NONE",
      },
    };

    const order = await razorpay.orders.create(options);

    await session.commitTransaction();

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
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
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
    const alreadyProcessed = await Payment.findOne({
      "webhookEvents.eventId": eventId,
    });

    if (alreadyProcessed) {
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Webhook already processed"));
    }

    /**
     * 4. Prepare Common Update
     */
    const baseUpdate = {
      razorpayPaymentId,
      $addToSet: {
        webhookEvents: {
          eventId,
          type: event,
          receivedAt: new Date(),
        },
      },
    };

    /**
     * 5. Handle Events
     */
    switch (event) {
      case "payment.captured":
        await Payment.findOneAndUpdate(
          { razorpayOrderId },
          {
            ...baseUpdate,
            status: PaymentStatus.CAPTURED,
            capturedAt: new Date(),
            method: paymentEntity.method,
          },
        );
        break;

      case "payment.failed":
        await Payment.findOneAndUpdate(
          { razorpayOrderId },
          {
            ...baseUpdate,
            status: PaymentStatus.FAILED,
            failureReason: paymentEntity.error_description,
          },
        );
        break;

      case "payment.authorized":
        await Payment.findOneAndUpdate(
          { razorpayOrderId },
          {
            ...baseUpdate,
            status: PaymentStatus.AUTHORIZED,
          },
        );
        break;

      default:
        console.log(`Unhandled event: ${event}`);
    }

    /**
     * 6. Always respond 200
     */
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Webhook processed successfully"));
  } catch (error) {
    console.error("Webhook Error:", error);

    /**
     * Important:
     * Return 500 → Razorpay retries
     */
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Webhook processing failed"));
  }
};
