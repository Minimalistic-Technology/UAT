import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
    user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_here');

            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ error: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ error: 'Not authorized, no token' });
    }
};

export const adminMode = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ error: 'Not authorized as admin' });
    }
};

export const adminOrHRAdminMode = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user && (req.user.role === 'Admin' || req.user.role === 'HRAdmin')) {
        next();
    } else {
        res.status(403).json({ error: 'Not authorized' });
    }
};
