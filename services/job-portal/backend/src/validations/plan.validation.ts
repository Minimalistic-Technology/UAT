import { body } from "express-validator";

export const createPlanSchema = [
  body("name").notEmpty().withMessage("Plan name is required"),
  body("price")
    .isNumeric()
    .withMessage("Price is required and must be a number"),
  body("currency")
    .optional()
    .isString()
    .isIn(["INR", "USD", "EUR", "GBP"])
    .withMessage("Invalid currency"),
  body("durationDays")
    .isInt({ min: 1 })
    .withMessage("Duration must be at least 1 day"),
  body("jobPostLimit")
    .isInt({ min: -1 })
    .withMessage("Job post limit is required (-1 for unlimited)"),

  body("features").isArray(),
  body("features.*")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Feature text cannot be empty"),

  body("isFeatured").isBoolean().withMessage("isFeatured must be a boolean"),
  body("isActive").isBoolean().withMessage("isActive must be a boolean"),
  body("isDefault").isBoolean().withMessage("isDefault must be a boolean"),
  body("displayOrder").isInt().withMessage("Display order must be a number"),
  body("allowResumeDownload")
    .isBoolean()
    .withMessage("allowResumeDownload must be a boolean"),
  body("postValidityDays")
    .isInt({ min: 1 })
    .withMessage("Post validity is required"),
];

export const updatePlanSchema = [
  body("name").optional().notEmpty().withMessage("Plan name cannot be empty"),
  body("price").optional().isNumeric().withMessage("Price must be a number"),
  body("currency")
    .optional()
    .isString()
    .isIn(["INR", "USD", "EUR", "GBP"])
    .withMessage("Invalid currency"),
  body("durationDays")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Duration must be at least 1 day"),
  body("jobPostLimit")
    .optional()
    .isInt({ min: -1 })
    .withMessage("Job post limit must be at least -1"),
  body("allowResumeDownload")
    .optional()
    .isBoolean()
    .withMessage("allowResumeDownload must be a boolean"),
  body("postValidityDays")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Post validity is required"),
];
