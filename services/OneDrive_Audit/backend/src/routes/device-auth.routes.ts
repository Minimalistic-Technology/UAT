import { Router, Request, Response } from 'express';
import { DeviceAuthService } from '../services/device-auth.service';
import { GraphService } from '../services/graph.service';
import mongoose from 'mongoose';

const router = Router();

// In-memory store for active polling sessions (use Redis in production)
const pendingSessions: Map<string, { deviceCode: string; polling: boolean }> = new Map();

/** POST /api/device-auth/start - Returns user_code for user to enter at microsoft.com/devicelogin */
router.post('/start', async (req: Request, res: Response) => {
    try {
        const data = await DeviceAuthService.getDeviceCode();
        const sessionId = new mongoose.Types.ObjectId().toString();

        pendingSessions.set(sessionId, { deviceCode: data.device_code, polling: false });

        // Return only what frontend needs
        res.status(200).json({
            sessionId,
            userCode: data.user_code,
            verificationUri: data.verification_uri,
            message: data.message,
            expiresIn: data.expires_in,
        });
    } catch (error: any) {
        console.error('Device code error:', error?.response?.data || error.message);
        res.status(500).json({ error: 'Failed to generate device code' });
    }
});

/** POST /api/device-auth/poll - Frontend polls this to check if user has signed in */
router.post('/poll', async (req: Request, res: Response) => {
    const { sessionId } = req.body;
    const session = pendingSessions.get(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found or expired' });
    if (session.polling) return res.status(200).json({ status: 'pending' });

    session.polling = true;

    try {
        const tokenData = await DeviceAuthService.pollForToken(session.deviceCode);
        pendingSessions.delete(sessionId);

        // Get user info from Graph API
        const { default: axios } = await import('axios');
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
    } catch (error: any) {
        pendingSessions.delete(sessionId);
        res.status(400).json({ error: error.message });
    }
});

export default router;
