import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

export const createTestimonial = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { content, rating, authorName, authorRole, authorCompany } = req.body;

    const testimonial = await prisma.testimonial.create({
      data: {
        userId: req.user?.id,
        content,
        rating: rating || 5,
        authorName,
        authorRole,
        authorCompany,
      },
      include: {
        user: true,
      },
    });

    res
      .status(201)
      .json(
        new ApiResponse(201, testimonial, "Testimonial created successfully"),
      );
  } catch (error) {
    next(error);
  }
};

export const updateTestimonial = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { content, rating, authorName, authorRole, authorCompany } = req.body;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id: String(id) },
    });

    if (!testimonial) {
      throw new ApiError(404, "Testimonial not found");
    }

    const updatedTestimonial = await prisma.testimonial.update({
      where: { id: String(id) },
      data: {
        content,
        rating,
        authorName,
        authorRole,
        authorCompany,
      },
      include: {
        user: true,
      },
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedTestimonial,
          "Testimonial updated successfully",
        ),
      );
  } catch (error) {
    next(error);
  }
};

export const deleteTestimonial = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id: String(id) },
    });

    if (!testimonial) {
      throw new ApiError(404, "Testimonial not found");
    }

    await prisma.testimonial.delete({
      where: { id: String(id) },
    });

    res
      .status(200)
      .json(new ApiResponse(200, null, "Testimonial deleted successfully"));
  } catch (error) {
    next(error);
  }
};
