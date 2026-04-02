import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Coupon from "../models/Coupon.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const createCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, type, value, isActive, expiryDate, maxUses } = req.body;

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return next(new ApiError(400, "Coupon code already exists"));
    }

    if (type === "percentage" && value > 100) {
      return next(new ApiError(400, "Percentage value cannot exceed 100"));
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      value,
      isActive,
      expiryDate,
      maxUses: maxUses === -1 ? -1 : maxUses,
    });

    res.status(201).json(
      new ApiResponse(201, coupon, "Coupon created successfully")
    );
  } catch (error: any) {
    next(error);
  }
};

export const getCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await Coupon.find().sort("-createdAt");

    res.status(200).json(
      new ApiResponse(200, {
        count: coupons.length,
        data: coupons,
      }, "Coupons fetched successfully")
    );
  } catch (error: any) {
    next(error);
  }
};

export const applyCoupon = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { code, baseAmount } = req.body;

    // Atomically find the valid coupon and increment its usageCount
    const coupon = await Coupon.findOneAndUpdate(
      {
        code: code.toUpperCase(),
        isActive: true,
        $or: [
          { expiryDate: { $gt: new Date() } },
          { expiryDate: null },
          { expiryDate: { $exists: false } }
        ],
        $and: [
          {
            $or: [
              { maxUses: { $exists: false } },
              { maxUses: null },
              { $expr: { $lt: ["$usageCount", "$maxUses"] } }
            ]
          }
        ]
      },
      {
        $inc: { usageCount: 1 }
      },
      { new: true, session }
    );

    if (!coupon) {
      throw new ApiError(400, "Coupon is invalid, expired, or has reached its usage limit");
    }

    // Calculate discounted amount
    let discountValue = 0;
    if (coupon.type === "percentage") {
      discountValue = Number(((baseAmount * coupon.value) / 100).toFixed(2));
    } else if (coupon.type === "amount") {
      discountValue = coupon.value;
    }

    // Ensure discount doesn't exceed original price
    if (discountValue > baseAmount) {
      discountValue = baseAmount;
    }

    const finalPrice = Number((baseAmount - discountValue).toFixed(2));

    await session.commitTransaction();

    res.status(200).json(
      new ApiResponse(200, {
        coupon,
        baseAmount,
        discountValue,
        finalPrice
      }, "Coupon applied successfully")
    );
  } catch (error: any) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, baseAmount } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      $or: [
        { expiryDate: { $gt: new Date() } },
        { expiryDate: null },
        { expiryDate: { $exists: false } }
      ],
      $and: [
        {
          $or: [
            { maxUses: { $exists: false } },
            { maxUses: null },
            { $expr: { $lt: ["$usageCount", "$maxUses"] } }
          ]
        }
      ]
    });

    if (!coupon) {
      throw new ApiError(400, "Coupon is invalid, expired, or has reached its usage limit");
    }

    let discountValue = 0;
    if (coupon.type === "percentage") {
      discountValue = Number(((baseAmount * coupon.value) / 100).toFixed(2));
    } else if (coupon.type === "amount") {
      discountValue = coupon.value;
    }

    if (discountValue > baseAmount) {
      discountValue = baseAmount;
    }

    const finalPrice = Number((baseAmount - discountValue).toFixed(2));

    res.status(200).json(
      new ApiResponse(200, {
        coupon,
        baseAmount,
        discountValue,
        finalPrice
      }, "Coupon is valid")
    );
  } catch (error: any) {
    next(error);
  }
};