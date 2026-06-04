"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const User_1 = __importDefault(require("../models/User"));
// In-memory cache to avoid calling Graph API /me on every request
const tokenCache = new Map();
const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
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
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
            if (decoded && decoded.id) {
                req.user = decoded;
                tokenCache.set(token, decoded);
                return next();
            }
        }
        catch (e) {
            // Not a local token, continue to Microsoft Graph verification
        }
        // 2. Microsoft Graph access token verification
        // Hit Microsoft Graph /me endpoint to verify the token and get user profile
        const graphRes = await axios_1.default.get('https://graph.microsoft.com/v1.0/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const profile = graphRes.data;
        const microsoftId = profile.id;
        const email = profile.mail || profile.userPrincipalName;
        const name = profile.displayName || 'OneDrive User';
        // Upsert user in our MongoDB
        let user = await User_1.default.findOne({ microsoftId });
        if (!user) {
            user = await User_1.default.create({
                microsoftId,
                email,
                name,
                accessToken: token,
                refreshToken: 'none', // not available in client token
                tokenExpiresAt: new Date(Date.now() + 3600 * 1000) // assume 1 hour
            });
        }
        else {
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
    }
    catch (ex) {
        console.error('Auth middleware error:', ex.response?.data || ex.message);
        res.status(401).json({ error: 'Invalid or expired Microsoft token.' });
    }
};
exports.authMiddleware = authMiddleware;
