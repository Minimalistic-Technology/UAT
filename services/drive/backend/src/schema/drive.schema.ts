import { z } from 'zod';

export const folderIdSchema = z.object({
  query: z.object({
    folderId: z.string().min(1, "Folder ID is required"),
  }),
});

export const sendCSVFileSchema = z.object({
  body: z.object({
    recipientEmail: z.string().email("Invalid email address"),
    fileName: z.string().min(1, "File name is required").endsWith(".csv", "Must be a .csv file"),
    csvData: z.string().min(1, "CSV data cannot be empty"),
  }),
});