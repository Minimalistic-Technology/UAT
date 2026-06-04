import { validationResult } from "express-validator";
import { ApiError } from "../utils/apiError.js";
export const validate = (validations) => {
    return async (req, res, next) => {
        // Run all validations
        await Promise.all(validations.map((validation) => validation.run(req)));
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        console.log("Errors", errors);
        const extractedErrors = [];
        errors.array().map((err) => extractedErrors.push(err.msg));
        return res
            .status(400)
            .json(new ApiError(400, `Validation failed: ${extractedErrors[0]}`, extractedErrors));
    };
};
