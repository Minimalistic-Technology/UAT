"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceAuthService = void 0;
const axios_1 = __importDefault(require("axios"));
const TENANT_ID = process.env.MICROSOFT_TENANT_ID || 'common';
const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const SCOPES = 'User.Read Files.Read.All offline_access';
class DeviceAuthService {
    /** Step 1: Get device code from Microsoft */
    static async getDeviceCode() {
        const response = await axios_1.default.post(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/devicecode`, new URLSearchParams({
            client_id: CLIENT_ID,
            scope: SCOPES,
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        return response.data;
        // Returns: { device_code, user_code, verification_uri, expires_in, interval, message }
    }
    /** Step 2: Poll for token after user enters code */
    static async pollForToken(deviceCode) {
        const maxAttempts = 30;
        let attempts = 0;
        while (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 5000)); // wait 5 seconds between polls
            attempts++;
            try {
                const response = await axios_1.default.post(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, new URLSearchParams({
                    grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
                    client_id: CLIENT_ID,
                    device_code: deviceCode,
                }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
                return response.data; // { access_token, refresh_token, expires_in }
            }
            catch (err) {
                const errCode = err?.response?.data?.error;
                if (errCode === 'authorization_pending')
                    continue; // keep polling
                if (errCode === 'authorization_declined')
                    throw new Error('User declined authorization');
                if (errCode === 'expired_token')
                    throw new Error('Code expired. Please try again.');
                throw err;
            }
        }
        throw new Error('Polling timeout. Please try again.');
    }
}
exports.DeviceAuthService = DeviceAuthService;
