import type { Request, Response, NextFunction } from "express";
import { Prisma } from "../../generated/prisma/client.js";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(err, res);
  }

  const statusCode = err.statusCode || 500;
  let message = err.message ?? "Internal Server Error";

  if (statusCode >= 500) {
    console.error(err.stack);
    if (process.env.NODE_ENV === "production") {
      message = "Internal Server Error";
    } else {
      // In development, Prisma and network errors can have massive stack traces in err.message
      // which ruins the toast UI on the frontend.
      if (message.length > 250 || message.includes("prisma") || message.includes("AggregateError")) {
        message = "A database or server error occurred. Please check the backend console for details.";
      }
    }
  } else {
    console.warn(`[API Error ${statusCode}]: ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

function handlePrismaError(err: any, res: Response) {
  if (err.code === "P2025") {
    return res
      .status(404)
      .json({ success: false, message: "Record not found" });
  }
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: `Duplicate value for ${err.meta?.target}`,
    });
  }
  if (err.code === "P2023") {
    return res
      .status(400)
      .json({ success: false, message: "Invalid ID format" });
  }
  if (err.code === "P2010") {
    return res
      .status(400)
      .json({ success: false, message: `Raw query failed: ${err.meta?.message || err.message}` });
  }

  // fallback for unhandled Prisma codes
  let cleanMessage = err.message;
  if (cleanMessage && cleanMessage.includes("\n")) {
    const parts = cleanMessage.split("\n");
    cleanMessage = parts[parts.length - 1];
  } else if (cleanMessage && cleanMessage.length > 250) {
    cleanMessage = cleanMessage.substring(0, 250) + "...";
  }

  return res
    .status(400)
    .json({ success: false, message: "Database request error: " + cleanMessage });
}
