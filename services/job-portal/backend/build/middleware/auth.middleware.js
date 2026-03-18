import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import User from "../models/User.model.js";
export const protect = async (req, res, next) => {
    try {
        let token;
        // Check for token in headers or cookies
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        else if (req.cookies.token) {
            token = req.cookies.token;
        }
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized to access this route",
            });
        }
        // Verify token
        const decoded = jwt.verify(token, config.jwtSecret);
        // Get user from token
        req.user = await User.findById(decoded.id);
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }
        if (!req.user.isActive) {
            return res.status(401).json({
                success: false,
                message: "User account is deactivated",
            });
        }
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: "Not authorized to access this route",
        });
    }
};
// Optional auth middleware: Populates req.user if token exists, but doesn't block if not
export const optionalAuth = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        if (!token) {
            return next(); // Proceed without req.user
        }
        const decoded = jwt.verify(token, config.jwtSecret);
        const user = await User.findById(decoded.id);
        if (user && user.isActive) {
            req.user = user;
        }
        next();
    }
    catch (error) {
        // Just ignore token errors and proceed as unauthenticated
        next();
    }
};
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`,
            });
        }
        next();
    };
};
