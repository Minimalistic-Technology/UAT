import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import razorpay from "../config/razorpay.js";
import Payment, { PaymentStatus } from "../models/Payment.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import crypto from "crypto";
import { config } from "../config/env.js";

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { amount, userId, internalOrderId, currency = "INR" } = req.body;

  if (amount < 1) {
    return next(new ApiError(400, "Amount must be greater than 0"));
  }

  try {
    const existingPayment = await Payment.findOne({
      "metadata.internalOrderId": internalOrderId,
    });

    if (existingPayment) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { orderId: existingPayment.razorpayOrderId },
            "Order already exists",
          ),
        );
    }

    const options = {
      amount,
      currency,
      receipt: internalOrderId,
    };

    const rpOrder = await razorpay.orders.create(options);

    const payment = await Payment.create({
      userId: new mongoose.Types.ObjectId(userId),
      amount,
      currency,
      razorpayOrderId: rpOrder.id,
      status: PaymentStatus.CREATED,
      receipt: internalOrderId,
      metadata: {
        internalOrderId,
      },
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { order: rpOrder, paymentId: payment._id },
          "Order created successfully",
        ),
      );
  } catch (error: any) {
    if (error.code === 11000) {
      const existingPayment = await Payment.findOne({
        "metadata.internalOrderId": internalOrderId,
      });

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { orderId: existingPayment?.razorpayOrderId },
            "Order already exists (race condition handled)",
          ),
        );
    }

    return next(new ApiError(500, error.message || "Something went wrong"));
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
      Buffer.from(signature)
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
      return res.status(200).json(new ApiResponse(200, null, "Webhook ignored"));
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
      return res.status(200).json(new ApiResponse(200, null, "Webhook already processed"));
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
          }
        );
        break;

      case "payment.failed":
        await Payment.findOneAndUpdate(
          { razorpayOrderId },
          {
            ...baseUpdate,
            status: PaymentStatus.FAILED,
            failureReason: paymentEntity.error_description,
          }
        );
        break;

      case "payment.authorized":
        await Payment.findOneAndUpdate(
          { razorpayOrderId },
          {
            ...baseUpdate,
            status: PaymentStatus.AUTHORIZED,
          }
        );
        break;

      default:
        console.log(`Unhandled event: ${event}`);
    }

    /**
     * 6. Always respond 200
     */
    return res.status(200).json(new ApiResponse(200, null, "Webhook processed successfully"));

  } catch (error) {
    console.error("Webhook Error:", error);

    /**
     * Important:
     * Return 500 → Razorpay retries
     */
    return res.status(500).json(new ApiResponse(500, null, "Webhook processing failed"));
  }
};