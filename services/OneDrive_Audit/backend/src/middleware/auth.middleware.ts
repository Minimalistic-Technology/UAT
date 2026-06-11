import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from '../models/User';

// In-memory cache to avoid calling Graph API /me on every request
const tokenCache = new Map<string, any>();

export interface AuthRequest extends Request {
    user?: any;
    token?: string;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token || token === 'undefined' || token === 'null') {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    req.token = token;

    // Check in-memory cache first
    if (tokenCache.has(token)) {
        req.user = tokenCache.get(token);
        return next();
    }

    try {
        // 1. Try if it's a local backend JWT (signed by our JWT_SECRET)
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
            if (decoded && decoded.id) {
                req.user = decoded;
                tokenCache.set(token, decoded);
                return next();
            }
        } catch (e) {
            // Not a local token, continue to Microsoft Graph verification
        }

        // 2. Microsoft Graph access token verification
        // Hit Microsoft Graph /me endpoint to verify the token and get user profile
        const graphRes = await axios.get('https://graph.microsoft.com/v1.0/me', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const profile = graphRes.data;
        const microsoftId = profile.id;
        const email = profile.mail || profile.userPrincipalName;
        const name = profile.displayName || 'OneDrive User';

        // Upsert user in our MongoDB
        let user = await User.findOne({ microsoftId });
        if (!user) {
            user = await User.create({
                microsoftId,
                email,
                name,
                accessToken: token,
                refreshToken: 'none', // not available in client token
                tokenExpiresAt: new Date(Date.now() + 3600 * 1000) // assume 1 hour
            });
        } else {
            // Update token
            user.accessToken = token;
            await user.save();
        }

        const userData = {
            id: user._id.toString(),
            microsoftId: user.microsoftId,
            email: user.email,
            name: user.name
        };

        // Cache the result
        tokenCache.set(token, userData);
        req.user = userData;
        next();

    } catch (ex: any) {
        // Silently return 401 to prevent flooding the server console when user tokens expire naturally
        res.status(401).json({ error: 'Invalid or expired Microsoft token. Please re-login.' });
    }
};
