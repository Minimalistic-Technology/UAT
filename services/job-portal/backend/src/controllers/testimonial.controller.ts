import { Response, NextFunction } from "express";
import { Testimonial } from "../models/Testimonial.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

export const createTestimonial = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { content, rating } = req.body;

    if (!content) {
      throw new ApiError(400, "Content is required");
    }

    const testimonial = await Testimonial.create({
      user: req.user?._id,
      content,
      rating,
    });

    await testimonial.populate("user");

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

    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      throw new ApiError(404, "Testimonial not found");
    }

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      id,
      req.body,
      { returnDocument: "after", runValidators: true },
    ).populate("user");

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

    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      throw new ApiError(404, "Testimonial not found");
    }

    await Testimonial.findByIdAndDelete(id);

    res
      .status(200)
      .json(new ApiResponse(200, null, "Testimonial deleted successfully"));
  } catch (error) {
    next(error);
  }
};
