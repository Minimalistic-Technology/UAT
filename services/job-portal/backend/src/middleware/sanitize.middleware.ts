import type { Request, Response, NextFunction } from 'express';
import mongoSanitize from 'express-mongo-sanitize';


export const sanitizeInput = [
  // Prevent MongoDB Operator Injection
  mongoSanitize({
    replaceWith: '_',
  }),
  
  
];

// Custom sanitizer for specific fields
export const sanitizeBody = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fields.forEach((field) => {
      if (req.body[field]) {
        req.body[field] = req.body[field].trim();
      }
    });
    next();
  };
};