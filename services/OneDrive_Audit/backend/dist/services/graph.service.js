"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphService = void 0;
const axios_1 = __importDefault(require("axios"));
class GraphService {
    static baseURL = 'https://graph.microsoft.com/v1.0';
    /** Fetch all files in OneDrive root directory recursively using search */
    static async getFiles(accessToken) {
        try {
            const allFiles = [];
            let url = `${this.baseURL}/me/drive/root/delta`;
            while (url) {
                const response = await axios_1.default.get(url, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                const data = response.data;
                if (data && data.value) {
                    allFiles.push(...data.value);
                }
                url = data['@odata.nextLink'] || null;
            }
            return allFiles;
        }
        catch (error) {
            console.error('Error fetching files from Graph API:', error);
            throw new Error('Failed to fetch files from Microsoft Graph');
        }
    }
    /** Fetch storage quota for user's OneDrive */
    static async getStorageQuota(accessToken) {
        try {
            const response = await axios_1.default.get(`${this.baseURL}/me/drive`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            return response.data.quota || null;
        }
        catch (error) {
            console.error('Error fetching quota:', error);
            throw new Error('Failed to fetch storage quota');
        }
    }
}
exports.GraphService = GraphService;
