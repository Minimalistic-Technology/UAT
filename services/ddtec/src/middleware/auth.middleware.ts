import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

interface AuthRequest extends Request {
    user?: any;
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
    // Get token from header or cookie
    const token = req.cookies?.token || req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

    // structured logging for debugging if needed
    // console.log(`[AUTH MIDDLEWARE] Path: ${req.path}, Token found: ${!!token}`);

    // Check if not token
    if (!token) {
        if (req.path === '/me') {
            console.log('[AUTH MIDDLEWARE] No token provided for /me (Expected for new sessions)');
        }
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // The payload *is* the user object (see auth.controller.ts)
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ msg: 'Authorization denied' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }
    next();
};

export default auth;
