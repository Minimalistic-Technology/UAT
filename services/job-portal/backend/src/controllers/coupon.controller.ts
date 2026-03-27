import { Request, Response } from "express";
import Coupon from "../models/Coupon.model.js";
class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/SuperAdmin
export const createCoupon = async (req: Request, res: Response, next: any) => {
  try {
    const { code, type, value, isActive, expiryDate, maxUses } = req.body;

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return next(new AppError("Coupon code already exists", 400));
    }

    if (type === "percentage" && value > 100) {
      return next(new AppError("Percentage value cannot exceed 100", 400));
    }

    const coupon = await Coupon.create({
      code,
      type,
      value,
      isActive,
      expiryDate,
      maxUses,
    });

    res.status(201).json({
      success: true,
      data: coupon,
    });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return res.status(400).json({
        success: false,
        message: "Invalid Input",
        errors: messages,
      });
    }
    next(new AppError(error.message || "Failed to create coupon", 500));
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/SuperAdmin
export const getCoupons = async (req: Request, res: Response, next: any) => {
  try {
    const coupons = await Coupon.find().sort("-createdAt");

    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (error: any) {
    next(new AppError("Failed to fetch coupons", 500));
  }
};
