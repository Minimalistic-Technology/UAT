import { body } from "express-validator";

export const createTestimonialValidator = [
  body("content").notEmpty().withMessage("Content is required"),
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("authorName").notEmpty().withMessage("Author name is required"),
  body("authorRole").optional().isString(),
  body("authorCompany").optional().isString(),
];

export const updateTestimonialValidator = [
  body("content").optional().notEmpty().withMessage("Content cannot be empty"),
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("authorName")
    .optional()
    .notEmpty()
    .withMessage("Author name cannot be empty"),
  body("authorRole").optional().isString(),
  body("authorCompany").optional().isString(),
];