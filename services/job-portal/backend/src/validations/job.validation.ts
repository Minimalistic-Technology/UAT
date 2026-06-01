import { body, param } from "express-validator";

export const createJobSchema = [
  body("title").trim().notEmpty().withMessage("Job title is required"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Job description is required"),

  body("jobType").notEmpty().withMessage("Job type is required"),
  body("workMode").notEmpty().withMessage("Work mode is required"),
  body("companyType").notEmpty().withMessage("Company type is required"),
  body("roleCategory").notEmpty().withMessage("Role category is required"),
  body("industry").notEmpty().withMessage("Industry is required"),
  body("experienceLevel")
    .notEmpty()
    .withMessage("Experience level is required"),

  body("experienceInYears")
    .notEmpty()
    .withMessage("Experience in years is required")
    .isInt({ min: 0 })
    .withMessage("Experience must be a non-negative integer"),

  body("openings").isInt({ min: 1 }).withMessage("Openings must be at least 1"),

  // Location Object
  body("location.city").if((value, { req }) => req.body.workMode !== "remote").trim().notEmpty().withMessage("City is required for non-remote roles"),
  body("location.state").if((value, { req }) => req.body.workMode !== "remote").trim().notEmpty().withMessage("State is required for non-remote roles"),
  body("location.country").if((value, { req }) => req.body.workMode !== "remote").trim().notEmpty().withMessage("Country is required for non-remote roles"),

  // Education Object
  body("education.minimumDegree")
    .notEmpty()
    .withMessage("Minimum degree is required"),
  body("education.preferredFields")
    .optional()
    .isArray()
    .withMessage("Preferred fields must be an array"),
  body("education.preferredFields.*")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Preferred field cannot be empty"),
  body("education.isRequired")
    .optional()
    .isBoolean()
    .withMessage("isRequired must be a boolean")
    .default(false),

  // Salary Object
  body("salary.min")
    .optional({ values: "falsy" }) // treats empty string as absent
    .isNumeric()
    .withMessage("Min salary must be a number")
    .isFloat({ min: 0 })
    .withMessage("Min salary must be positive"),
  body("salary.max")
    .optional({ values: "falsy" })
    .isNumeric()
    .withMessage("Max salary must be a number")
    .isFloat({ min: 0 })
    .withMessage("Max salary must be positive")
    .custom((value, { req }) => {
      const min = req.body.salary?.min;
      if (value && min && Number(value) < Number(min)) {
        throw new Error("Max salary cannot be less than min salary");
      }
      return true;
    }),
  body("salary.currency").notEmpty().withMessage("Currency is required"),
  body("salary.period")
    .isIn(["hourly", "monthly", "yearly"])
    .withMessage("Invalid salary period"),

  // Arrays
  body("skills")
    .isArray({ min: 1 })
    .withMessage("At least one skill is required"),
  body("skills.*").trim().notEmpty().withMessage("Skill cannot be empty"),
  body("requirements")
    .isArray({ min: 1 })
    .withMessage("At least one requirement is required"),
  body("requirements.*")
    .trim()
    .notEmpty()
    .withMessage("Requirement cannot be empty"),
  body("benefits").optional().isArray(),

  // Dates & Status
  body("applicationDeadline")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Invalid deadline date")
    .toDate()
    .custom((value: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (value < today) {
        throw new Error("Deadline cannot be in the past");
      }
      return true;
    }),

  body("isFeatured").optional().isBoolean().default(false),
  body("status")
    .optional()
    .isIn(["active", "inactive", "draft"])
    .withMessage("Invalid status")
    .default("active"),
];

export const getJobByIdSchema = [
  param("id")
    .notEmpty()
    .withMessage("Job ID is required")
    .isMongoId()
    .withMessage("Invalid Job ID"),
];