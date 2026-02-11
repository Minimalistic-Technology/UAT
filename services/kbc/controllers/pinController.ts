import { Request, Response, NextFunction } from "express";
import { Pin } from "../models/Pin";
import { hashPin, comparePin, isValidPinFormat } from "../userUtils/pinUtils";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";

export const createPin = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const admin = (req as any).admin;
  const { pin } = req.body;

  if (!isValidPinFormat(pin)) return next(new ErrorHandler("PIN must be 4 digits", 400));

  const existingPin = await Pin.findOne({ userId: admin._id });
  if (existingPin) return next(new ErrorHandler("PIN already set", 400));

  const hashedPin = await hashPin(pin);
  await Pin.create({ userId: admin._id, hashedPin });

  res.status(201).json({ success: true, message: "PIN created successfully" });
});

 export const getPin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = (req as any).admin;
    const pin = await Pin.findOne({ userId: admin._id });
    res.status(200).json({ hasPin: !!pin });
  } catch (err) {
    next(err);
  }
};


export const verifyPin = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const {  pin } = req.body;
  const admin = (req as any).admin;
  const userId = admin._id;
  console.log(userId);

  if (!isValidPinFormat(pin)) return next(new ErrorHandler("PIN must be 4 digits", 400));

  const userPin = await Pin.findOne({ userId });
  if (!userPin) return next(new ErrorHandler("PIN not found", 404));

  const isMatch = await comparePin(pin, userPin.hashedPin);
  if (!isMatch) return next(new ErrorHandler("Invalid PIN", 401));

  res.status(200).json({ success: true, message: "PIN verified successfully" });
});

export const changePin = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const admin = (req as any).admin;
  const { oldPin, newPin } = req.body;

  if (!isValidPinFormat(newPin)) return next(new ErrorHandler("New PIN must be 4 digits", 400));

  const userPin = await Pin.findOne({ userId: admin._id });
  if (!userPin) return next(new ErrorHandler("PIN not set", 404));

  const isMatch = await comparePin(oldPin, userPin.hashedPin);
  if (!isMatch) return next(new ErrorHandler("Old PIN incorrect", 401));

  userPin.hashedPin = await hashPin(newPin);
  userPin.lastChanged = new Date();
  await userPin.save();

  res.status(200).json({ success: true, message: "PIN changed successfully" });
});

export const resetPin = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const admin = (req as any).admin;
  const { newPin } = req.body;

  if (!isValidPinFormat(newPin)) return next(new ErrorHandler("PIN must be 4 digits", 400));

  const hashedPin = await hashPin(newPin);
  await Pin.findOneAndUpdate(
    { userId: admin._id },
    { hashedPin, lastChanged: new Date() },
    { upsert: true }
  );

  res.status(200).json({ success: true, message: "PIN reset successfully" });
});