import { Request, Response, NextFunction } from "express";
import { Pin } from "../models/Pin";
import { generatePin, isValidPinFormat, isValidPinConfig } from "../userUtils/pinUtils";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";

/**
 * Create or update PIN configuration
 * Body: { pinConfig: [null, 9, null, null] } - array of 4 elements
 */
export const setPinConfig = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const admin = (req as any).admin;
  const { pinConfig } = req.body;

  if (!isValidPinConfig(pinConfig)) {
    return next(new ErrorHandler("Invalid PIN config. Must be array of 4 elements (null or 0-9)", 400));
  }

  await Pin.findOneAndUpdate(
    { userId: admin._id },
    { pinConfig, lastChanged: new Date() },
    { upsert: true, new: true }
  );

  res.status(200).json({
    success: true,
    message: "PIN configuration saved successfully",
    currentPin: generatePin(pinConfig)
  });
});

/**
 * Get current PIN configuration
 */
export const getPinConfig = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const admin = (req as any).admin;

  const pinDoc = await Pin.findOne({ userId: admin._id });

  if (!pinDoc) {
    // Return default config if none exists
    return res.status(200).json({
      success: true,
      pinConfig: [null, null, null, null],
      currentPin: generatePin([null, null, null, null])
    });
  }

  res.status(200).json({
    success: true,
    pinConfig: pinDoc.pinConfig,
    currentPin: generatePin(pinDoc.pinConfig)
  });
});

/**
 * Verify the entered PIN against the generated PIN
 */
export const verifyPin = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { pin } = req.body;
  const admin = (req as any).admin;

  if (!isValidPinFormat(pin)) {
    return next(new ErrorHandler("PIN must be 4 digits", 400));
  }

  const pinDoc = await Pin.findOne({ userId: admin._id });

  // If no config exists, use default [null, null, null, null] 
  const pinConfig = pinDoc ? pinDoc.pinConfig : [null, null, null, null];
  const correctPin = generatePin(pinConfig);

  if (pin !== correctPin) {
    return next(new ErrorHandler("Invalid PIN", 401));
  }

  res.status(200).json({ success: true, message: "PIN verified successfully" });
});

/**
 * Check if PIN configuration exists
 */
export const checkPinExists = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const admin = (req as any).admin;
  const pinDoc = await Pin.findOne({ userId: admin._id });

  res.status(200).json({
    success: true,
    hasPin: !!pinDoc,
    pinConfig: pinDoc ? pinDoc.pinConfig : [null, null, null, null]
  });
});