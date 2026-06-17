import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../config/db';
import { ApiError } from '../utils/ApiError';

// Global in-memory cache for ultra-fast RBAC checks
let permissionsCache: any[] = [];
let lastCacheUpdate = 0;
const CACHE_TTL_MS = 60000; // 60 seconds

export const checkDbPermission = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required'));
        }

        const { role } = req.user;

        // Normalizing request path
        let fullPath = `${req.baseUrl}${req.path}`;
        if (fullPath.endsWith('/') && fullPath.length > 1) {
            fullPath = fullPath.slice(0, -1);
        }

        const method = req.method;
        const templatePath = req.route ? `${req.baseUrl}${req.route.path}` : fullPath;

        const now = Date.now();
        if (now - lastCacheUpdate > CACHE_TTL_MS || permissionsCache.length === 0) {
            permissionsCache = await prisma.routePermission.findMany(); // Fetch all, including inactive
            lastCacheUpdate = now;
        }

        const permission = permissionsCache.find((p: any) =>
            p.role === role &&
            (p.path === fullPath || p.path === templatePath) &&
            (p.method === method || p.method === null)
        );

        if (permission) {
            if (!permission.isActive) {
                console.warn(`[checkDbPermission] FEATURE OFF: role=${role}, method=${method}, fullPath=${fullPath}`);
                return next(
                    new ApiError(
                        StatusCodes.SERVICE_UNAVAILABLE,
                        `This feature is temporarily disabled by the administrator.`
                    )
                );
            }
            // If exists and active, allow passage
        } else {
            // Admin failsafe: If the route is merely unregistered, let admin perform the action.
            if (role === 'admin') {
                return next();
            }

            console.warn(`[checkDbPermission] UNREGISTERED BLOCK: role=${role}, method=${method}, fullPath=${fullPath}`);
            return next(
                new ApiError(
                    StatusCodes.FORBIDDEN,
                    `Access Denied: You do not have permission to perform ${method} on resource ${fullPath}`
                )
            );
        }

        next();
    } catch (error) {
        console.error('[checkDbPermission] Error:', error);
        next(error);
    }
};

export default checkDbPermission;
