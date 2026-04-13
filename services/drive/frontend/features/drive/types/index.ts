export type DriveFile = {
  id: string;
  name: string;
  mimeType?: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
};

export interface GetDriveFileResponse {
  count: number;
  files: DriveFile[]
}

export interface SendCSVParams { email: string, fileName: string, csvContent: string }