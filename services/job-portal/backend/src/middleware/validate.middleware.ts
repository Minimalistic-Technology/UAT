import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import type { ValidationChain } from "express-validator";
import { ApiError } from "../utils/apiError.js";

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    console.log("Errors", errors);

    const extractedErrors: any[] = [];
    errors.array().map((err: any) => extractedErrors.push(err.msg));

    return res
      .status(400)
      .json(
        new ApiError(
          400,
          `Validation failed: ${extractedErrors[0]}`,
          extractedErrors,
        ),
      );
  };
};
