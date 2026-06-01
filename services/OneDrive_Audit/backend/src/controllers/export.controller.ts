import { Request, Response } from 'express';
import File from '../models/File';
import User from '../models/User';
import ExportLog from '../models/ExportLog';
import { ExcelService } from '../services/excel.service';
import mongoose from 'mongoose';

export class ExportController {
    public exportExcel = async (req: Request, res: Response) => {
        try {
            let userId: mongoose.Types.ObjectId;

            // Try to get userId from authenticated token first
            const userIdString = (req as any).user?.id;
            if (userIdString) {
                userId = new mongoose.Types.ObjectId(userIdString);
            } else {
                // Fallback: get the most recently active user from DB
                const latestUser = await User.findOne({}).sort({ updatedAt: -1 });
                if (!latestUser) {
                    return res.status(404).json({ error: 'No user found. Please log in first.' });
                }
                userId = latestUser._id as mongoose.Types.ObjectId;
            }

            const files = await File.find({ userId }).sort({ createdAt: -1 });

            if (files.length === 0) {
                return res.status(404).json({ error: 'No files found. Please sync OneDrive first.' });
            }

            const fileName = `OneDrive_Audit_${new Date().toISOString().slice(0, 10)}.csv`;

            // Log the export
            await ExportLog.create({
                userId,
                fileName,
                fileCount: files.length
            });

            // Execute stream download (files mapped to plain objects)
            await ExcelService.generateExport(files.map(f => f.toJSON()), res);

        } catch (error) {
            console.error('Export Error:', error);
            res.status(500).json({ error: 'Failed to generate excel export' });
        }
    };
}
