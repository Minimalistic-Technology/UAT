import type { Request, Response, NextFunction } from "express";
import { getDriveFiles } from "../lib/get-files";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { folderIdSchema, sendCSVFileSchema } from "../schema/drive.schema";
import { shareCSVViaEmail } from "../utils/mail";

export const getDriveFilesController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = folderIdSchema.safeParse(req);

        if (!result.success) {
            const errorMessage = result.error.issues[0]?.message || "Invalid request parameters";
            throw new ApiError(400, errorMessage);
        }

        const { folderId } = result.data.query;

        const files = await getDriveFiles(folderId);

        if (!files || files.length === 0) {
            return res.status(200).json(
                new ApiResponse(200, [], 'No files found in the specified folder.'));
        }

        return res.status(200).json(
            new ApiResponse(200, { count: files.length, files }, "Files fetched successfully"));

    } catch (error: any) {
        console.error(`Error fetching Drive files for folder ${req.query.folderId}:`, error);
        next(error);
    }
}

export const handleShareCSV = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = sendCSVFileSchema.safeParse(req);

        if (!result.success) {
            const errorMsg = result.error.issues.map(i => i.message).join(", ");
            throw new ApiError(400, errorMsg);
        }

        const { recipientEmail, fileName, csvData } = result.data.body;

        await shareCSVViaEmail(recipientEmail, fileName, csvData);
        res.status(200).json(new ApiResponse(200, null, `File "${fileName}" has been sent to ${recipientEmail}`))
    } catch (error) {
        next(error);
    }
}