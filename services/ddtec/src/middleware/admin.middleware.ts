import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
    user?: any;
}

export default function (req: AuthRequest, res: Response, next: NextFunction) {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ msg: 'Access denied: Admins only' });
    }
};
