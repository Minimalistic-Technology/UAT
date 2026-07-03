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

    const adminRoles = ['super_admin', 'product_manager', 'order_manager', 'customer_support', 'finance', 'marketing', 'admin'];

    if (!adminRoles.includes(req.user.role)) {
        return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }
    next();
};

export const checkPermission = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ msg: 'Authorization denied' });
        }


        if (!allowedRoles.includes(req.user.role) && req.user.role !== 'super_admin' && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. You do not have permission for this action.' });
        }
        next();
    };
};

export const checkGranularPermission = (module: string, action: 'add' | 'edit' | 'delete' | 'view') => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ msg: 'Authorization denied' });
        }

        // Super admins and admins have all permissions
        if (req.user.role === 'super_admin' || req.user.role === 'admin') return next();

        let hasPermission = false;

        // Check legacy role-based permissions first
        const legacyAllowed = ROLE_PERMISSIONS[req.user.role as string] || [];
        if (legacyAllowed.includes(module)) {
            // For legacy roles, we often assume full access if they can see the module,
            // or we might want to restrict strictly. For now, let's treat legacy views as 'view' permission.
            if (action === 'view') hasPermission = true;
        }

        // Check granular permissions from user profile
        if (action === 'view') {
            const views = req.user.customPages || [];
            if (views.includes(module)) hasPermission = true;
        } else if (action === 'add') {
            const adds = req.user.addPages || [];
            if (adds.includes(module)) hasPermission = true;
        } else if (action === 'edit') {
            const edits = req.user.editPages || [];
            if (edits.includes(module)) hasPermission = true;
        } else if (action === 'delete') {
            const deletes = req.user.deletePages || [];
            if (deletes.includes(module)) hasPermission = true;
        }

        if (!hasPermission) {
            return res.status(403).json({ msg: `Access denied. You do not have '${action}' permission for '${module}'.` });
        }

        next();
    };
};

const ROLE_PERMISSIONS: Record<string, string[]> = {
    super_admin: ['dashboard', 'categories', 'products', 'inventory', 'orders', 'billing', 'coupons', 'users', 'messages', 'blogs', 'components'],
    product_manager: ['products', 'inventory', 'categories', 'dashboard'],
    order_manager: ['orders', 'billing', 'dashboard'],
    customer_support: ['users', 'messages', 'orders', 'dashboard'],
    finance: ['dashboard', 'billing'],
    marketing: ['coupons', 'blogs', 'dashboard'],
    admin: ['dashboard', 'categories', 'products', 'inventory', 'orders', 'billing', 'coupons', 'users', 'messages', 'blogs', 'components'],
    warehouse: ['orders', 'inventory'],
    inventory_manager: ['inventory', 'orders', 'products', 'categories', 'dashboard']
};

export default auth;
