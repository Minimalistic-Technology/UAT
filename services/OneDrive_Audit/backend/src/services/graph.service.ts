import axios from 'axios';

export class GraphService {
    private static baseURL = 'https://graph.microsoft.com/v1.0';

    /** Fetch all files in OneDrive root directory recursively using search */
    public static async getFiles(accessToken: string) {
        try {
            const allFiles = [];
            let url = `${this.baseURL}/me/drive/root/delta`;

            while (url) {
                const response: any = await axios.get(url, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                const data = response.data;
                if (data && data.value) {
                    allFiles.push(...data.value);
                }

                url = data['@odata.nextLink'] || null;
            }
            return allFiles;
        } catch (error: any) {
            console.error('Error fetching files from Graph API:', error.response?.data || error.message);
            const status = error.response?.status || 500;
            const newError = new Error('Failed to fetch files from Microsoft Graph');
            (newError as any).status = status;
            throw newError;
        }
    }

    /** Fetch storage quota for user's OneDrive */
    public static async getStorageQuota(accessToken: string) {
        try {
            const response = await axios.get(`${this.baseURL}/me/drive`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            return response.data.quota || null;
        } catch (error) {
            console.error('Error fetching quota:', error);
            throw new Error('Failed to fetch storage quota');
        }
    }
}
