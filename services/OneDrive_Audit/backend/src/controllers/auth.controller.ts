import { Request, Response } from 'express';
import crypto from 'crypto';

export class AuthController {

    public login = async (req: Request, res: Response) => {
        try {
            // Setup MSAL configuration and generate auth URL here
            // This will redirect user to Microsoft Consent screen
            const clientId = process.env.MICROSOFT_CLIENT_ID;
            const tenantId = process.env.MICROSOFT_TENANT_ID || 'common';
            const redirectUri = `${process.env.FRONTEND_URL}/auth/callback`;
            const scopes = 'User.Read Files.Read Files.Read.All offline_access';

            const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&response_mode=query&scope=${encodeURIComponent(scopes)}`;

            res.status(200).json({ url: authUrl });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to generate auth URL' });
        }
    };

    public callback = async (req: Request, res: Response) => {
        try {
            const { code } = req.body;
            if (!code) {
                return res.status(400).json({ error: 'Authorization code is missing' });
            }

            // Detailed MSAL/OAuth token exchange happens here
            // We will mock a successful response for the foundational template

            // 1. Exchange code for access & refresh tokens
            // 2. Encrypt tokens using AES-256
            // 3. Store/Update User in MySQL using Prisma
            // 4. Generate internal JWT for the frontend session
            const token = "mock_jwt_token"; // We will implement full JWT in Phase 2

            res.status(200).json({ success: true, token, user: { name: 'John Doe', email: 'john@organization.com' } });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'OAuth callback failed' });
        }
    };

    public getCurrentUser = async (req: Request, res: Response) => {
        // Requires middleware to extract user from `req.user`
        res.status(200).json({ user: 'Mock User Data' });
    };

    public logout = async (req: Request, res: Response) => {
        // Invalidate session/tokens
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    };
}
