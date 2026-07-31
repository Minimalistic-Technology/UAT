import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

export const createCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { code, type, value, isActive, expiryDate, maxUses } = req.body;

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingCoupon) {
      return next(new ApiError(400, "Coupon code already exists"));
    }

    if (type.toLowerCase() === "percentage" && value > 100) {
      return next(new ApiError(400, "Percentage value cannot exceed 100"));
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        type: type.toUpperCase(), // PERCENTAGE or AMOUNT
        value,
        isActive: isActive ?? true,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        maxUses: maxUses === -1 ? -1 : maxUses,
      },
    });

    res
      .status(201)
      .json(new ApiResponse(201, coupon, "Coupon created successfully"));
  } catch (error: any) {
    next(error);
  }
};

export const applyCoupon = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { code, baseAmount } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const result = await prisma.$transaction(async (tx) => {
      const coupon = await tx.coupon.findUnique({
        where: { code: code.toUpperCase() },
        include: {
          usages: {
            where: { userId },
          },
        },
      });

      if (!coupon) {
        throw new ApiError(400, "Coupon is invalid or does not exist");
      }

      if (!coupon.isActive) {
        throw new ApiError(400, "Coupon is not active");
      }

      if (coupon.expiryDate && coupon.expiryDate < new Date()) {
        throw new ApiError(400, "Coupon has expired");
      }

      if (
        coupon.maxUses !== null &&
        coupon.maxUses !== -1 &&
        coupon.usageCount >= coupon.maxUses
      ) {
        throw new ApiError(400, "Coupon usage limit reached");
      }

      if (coupon.usages.length > 0) {
        throw new ApiError(400, "Coupon has already been used by you");
      }

      // Calculate discounted amount
      let discountValue = 0;
      if (coupon.type === "PERCENTAGE") {
        discountValue = Number(((baseAmount * coupon.value) / 100).toFixed(2));
      } else if (coupon.type === "AMOUNT") {
        discountValue = coupon.value;
      }

      if (discountValue > baseAmount) {
        discountValue = baseAmount;
      }

      const finalPrice = Number((baseAmount - discountValue).toFixed(2));

      // Update usage count and create usage record
      const updatedCoupon = await tx.coupon.update({
        where: { id: coupon.id },
        data: {
          usageCount: { increment: 1 },
          usages: {
            create: {
              userId,
              discountApplied: Math.round(discountValue),
            },
          },
        },
      });

      return {
        coupon: updatedCoupon,
        baseAmount,
        discountValue,
        finalPrice,
      };
    });

    res
      .status(200)
      .json(new ApiResponse(200, result, "Coupon applied successfully"));
  } catch (error: any) {
    next(error);
  }
};

export const validateCoupon = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { code, baseAmount } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        usages: {
          where: { userId },
        },
      },
    });

    if (!coupon) {
      throw new ApiError(400, "Coupon is invalid or does not exist");
    }

    if (!coupon.isActive) {
      throw new ApiError(400, "Coupon is not active");
    }

    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      throw new ApiError(400, "Coupon has expired");
    }

    if (
      coupon.maxUses !== null &&
      coupon.maxUses !== -1 &&
      coupon.usageCount >= coupon.maxUses
    ) {
      throw new ApiError(400, "Coupon usage limit reached");
    }

    if (coupon.usages.length > 0) {
      throw new ApiError(400, "Coupon has already been used by you");
    }

    let discountValue = 0;
    if (coupon.type === "PERCENTAGE") {
      discountValue = Number(((baseAmount * coupon.value) / 100).toFixed(2));
    } else if (coupon.type === "AMOUNT") {
      discountValue = coupon.value;
    }

    if (discountValue > baseAmount) {
      discountValue = baseAmount;
    }

    const finalPrice = Number((baseAmount - discountValue).toFixed(2));

    res.status(200).json(
      new ApiResponse(
        200,
        {
          coupon,
          baseAmount,
          discountValue,
          finalPrice,
        },
        "Coupon is valid",
      ),
    );
  } catch (error: any) {
    next(error);
  }
};

export const updateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { code, type, value, isActive, expiryDate, maxUses } = req.body;

    const coupon = await prisma.coupon.findUnique({
      where: { id: String(id) },
    });

    if (!coupon) {
      return next(new ApiError(404, "Coupon not found"));
    }

    const updateData: any = {};

    if (code) {
      const existingCoupon = await prisma.coupon.findFirst({
        where: {
          code: code.toUpperCase(),
          id: { not: String(id) },
        },
      });
      if (existingCoupon) {
        return next(new ApiError(400, "Coupon code already exists"));
      }
      updateData.code = code.toUpperCase();
    }

    if (type) updateData.type = type.toUpperCase();

    if (value !== undefined) {
      const finalType = type ? type.toUpperCase() : coupon.type;
      if (finalType === "PERCENTAGE" && value > 100) {
        return next(new ApiError(400, "Percentage value cannot exceed 100"));
      }
      updateData.value = value;
    }

    if (isActive !== undefined) updateData.isActive = isActive;

    if (expiryDate !== undefined) {
      if (expiryDate === "" || expiryDate === null) {
        updateData.expiryDate = null;
      } else {
        updateData.expiryDate = new Date(expiryDate);
      }
    }

    if (maxUses !== undefined) {
      if (maxUses === null || maxUses === "") {
        updateData.maxUses = -1;
      } else {
        updateData.maxUses =
          maxUses === -1
            ? -1
            : typeof maxUses === "string"
              ? parseInt(maxUses)
              : maxUses;
      }
    }

    const updatedCoupon = await prisma.coupon.update({
      where: { id: String(id) },
      data: updateData,
    });

    res
      .status(200)
      .json(new ApiResponse(200, updatedCoupon, "Coupon updated successfully"));
  } catch (error: any) {
    next(error);
  }
};

export const deleteCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.findUnique({
      where: { id: String(id) },
    });

    if (!coupon) {
      return next(new ApiError(404, "Coupon not found"));
    }

    await prisma.coupon.delete({ where: { id: String(id) } });

    res
      .status(200)
      .json(new ApiResponse(200, null, "Coupon deleted successfully"));
  } catch (error: any) {
    next(error);
  }
};
