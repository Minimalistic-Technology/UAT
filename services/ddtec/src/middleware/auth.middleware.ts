import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

interface AuthRequest extends Request {
    user?: any;
}

export default function (req: AuthRequest, res: Response, next: NextFunction) {
    // Get token from header or cookie
    const token = req.cookies?.token || req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

    console.log('Auth Middleware Debug:');
    console.log('Cookies:', req.cookies);
    console.log('Headers:', req.headers);
    console.log('Found Token:', token);

    // Check if not token
    if (!token) {
        console.log('No token found -> 401');
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
