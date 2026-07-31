"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const device_auth_service_1 = require("../services/device-auth.service");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
// In-memory store for active polling sessions (use Redis in production)
const pendingSessions = new Map();
/** POST /api/device-auth/start - Returns user_code for user to enter at microsoft.com/devicelogin */
router.post('/start', async (req, res) => {
    try {
        const data = await device_auth_service_1.DeviceAuthService.getDeviceCode();
        const sessionId = new mongoose_1.default.Types.ObjectId().toString();
        pendingSessions.set(sessionId, { deviceCode: data.device_code, polling: false });
        // Return only what frontend needs
        res.status(200).json({
            sessionId,
            userCode: data.user_code,
            verificationUri: data.verification_uri,
            message: data.message,
            expiresIn: data.expires_in,
        });
    }
    catch (error) {
        console.error('Device code error:', error?.response?.data || error.message);
        res.status(500).json({ error: 'Failed to generate device code' });
    }
});
/** POST /api/device-auth/poll - Frontend polls this to check if user has signed in */
router.post('/poll', async (req, res) => {
    const { sessionId } = req.body;
    const session = pendingSessions.get(sessionId);
    if (!session)
        return res.status(404).json({ error: 'Session not found or expired' });
    if (session.polling)
        return res.status(200).json({ status: 'pending' });
    session.polling = true;
    try {
        const tokenData = await device_auth_service_1.DeviceAuthService.pollForToken(session.deviceCode);
        pendingSessions.delete(sessionId);
        // Get user info from Graph API
        const { default: axios } = await Promise.resolve().then(() => __importStar(require('axios')));
        const userInfo = await axios.get('https://graph.microsoft.com/v1.0/me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        res.status(200).json({
            status: 'success',
            accessToken: tokenData.access_token,
            user: {
                name: userInfo.data.displayName,
                email: userInfo.data.mail || userInfo.data.userPrincipalName,
            }
        });
    }
    catch (error) {
        pendingSessions.delete(sessionId);
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
