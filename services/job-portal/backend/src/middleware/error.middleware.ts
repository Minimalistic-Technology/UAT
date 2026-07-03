import type { Request, Response, NextFunction } from "express";
import { Prisma } from "../../generated/prisma/client.js";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    handlePrismaError(err, res);
  }

  const statusCode = err.statusCode || 500;
  let message = err.message ?? "Internal Server Error";

  if (statusCode >= 500) {
    console.error(err.stack);
    if (process.env.NODE_ENV === "production") {
      message = "Internal Server Error";
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

  // fallback for unhandled Prisma codes
  return res
    .status(400)
    .json({ success: false, message: "Database request error" });
}
