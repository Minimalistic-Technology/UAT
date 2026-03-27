import mongoSanitize from 'express-mongo-sanitize';
export const sanitizeInput = [
    // Prevent MongoDB Operator Injection
    mongoSanitize({
        replaceWith: '_',
    }),
];
// Custom sanitizer for specific fields
export const sanitizeBody = (fields) => {
    return (req, res, next) => {
        fields.forEach((field) => {
            if (req.body[field]) {
                req.body[field] = req.body[field].trim();
            }
        });
        next();
    };
};
