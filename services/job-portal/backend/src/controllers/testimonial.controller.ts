import { Request, Response, NextFunction } from "express";
import { Testimonial } from "../models/Testimonial.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

// @desc    Get all active testimonials (for public)
// @route   GET /api/v1/testimonials
// @access  Public
export const getTestimonials = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;

        // Sort by featured first, then newest
        const testimonials = await Testimonial.find({ isActive: true })
            .sort({ isFeatured: -1, createdAt: -1 })
            .limit(limit);

        res.status(200).json(
            new ApiResponse(200, testimonials, "Testimonials fetched successfully")
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Create a testimonial
// @route   POST /api/v1/testimonials
// @access  Private (Admin)
export const createTestimonial = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, role, company, content, avatarUrl, rating, isActive, isFeatured } = req.body;

        if (!name || !role || !content) {
            throw new ApiError(400, "Name, role, and content are required fields");
        }

        const testimonial = await Testimonial.create({
            name,
            role,
            company,
            content,
            avatarUrl,
            rating,
            isActive,
            isFeatured
        });

        res.status(201).json(
            new ApiResponse(201, testimonial, "Testimonial created successfully")
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Update a testimonial
// @route   PUT /api/v1/testimonials/:id
// @access  Private (Admin)
export const updateTestimonial = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const testimonial = await Testimonial.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!testimonial) {
            throw new ApiError(404, "Testimonial not found");
        }

        res.status(200).json(
            new ApiResponse(200, testimonial, "Testimonial updated successfully")
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a testimonial
// @route   DELETE /api/v1/testimonials/:id
// @access  Private (Admin)
export const deleteTestimonial = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const testimonial = await Testimonial.findByIdAndDelete(id);

        if (!testimonial) {
            throw new ApiError(404, "Testimonial not found");
        }

        res.status(200).json(
            new ApiResponse(200, null, "Testimonial deleted successfully")
        );
    } catch (error) {
        next(error);
    }
};
