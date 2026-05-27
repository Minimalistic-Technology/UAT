import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

interface AuthRequest extends Request {
    user?: any;
}

export default function (req: AuthRequest, res: Response, next: NextFunction) {
    // Get token from header or cookie
    const token = req.cookies?.token || req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

    // If no token, just proceed as guest
    if (!token) {
        return next();
    }

    // Verify token if present
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        // Token invalid/expired - proceed as guest, or log warning
        console.warn("Optional Auth: Token invalid", err);
        next();
    }
};
