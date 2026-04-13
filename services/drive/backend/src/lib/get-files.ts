import { google } from 'googleapis';
import path from "path";
import { ApiError } from '../utils/apiError';

export async function getDriveFiles(folderId: string) {
    const jsonFilePath = path.join(process.cwd(), "service-account-credentials.json");
  try {
    const auth = new google.auth.GoogleAuth({
      keyFilename: jsonFilePath,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });
    
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink)',
      pageSize: 100
    });

    return response.data.files;
  } catch (error) {
    console.error('Drive API Error:', error);
    throw new ApiError(500, 'Failed to fetch files from Google Drive')
  }
}