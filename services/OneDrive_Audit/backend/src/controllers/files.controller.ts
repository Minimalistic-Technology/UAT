import { Request, Response } from 'express';
import File from '../models/File';
import User from '../models/User';
import { GraphService } from '../services/graph.service';
import mongoose from 'mongoose';

export class FilesController {

    public getFiles = async (req: Request, res: Response) => {
        try {
            // Mocking user for now (in real app, use req.user.id)
            const mockUserId = new mongoose.Types.ObjectId("664f33190a424260bd192931");
            const userIdString = (req as any).user?.id;
            const userId = userIdString ? new mongoose.Types.ObjectId(userIdString as string) : mockUserId;

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;

            const files = await File.find({ userId })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            const total = await File.countDocuments({ userId });
            const storageAgg = await File.aggregate([
                { $match: { userId } },
                { $group: { _id: null, totalSize: { $sum: '$fileSize' } } }
            ]);
            const storage = storageAgg.length > 0 ? storageAgg[0].totalSize : 0;

            res.status(200).json({
                files: files.map(f => f.toJSON()),
                total,
                totalPages: Math.ceil(total / limit),
                totalStorageBytes: storage.toString()
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch files' });
        }
    };

    public syncFiles = async (req: Request, res: Response) => {
        try {
            // Mocking user (In real app, extract from token and check in DB)
            const mockUserId = new mongoose.Types.ObjectId("664f33190a424260bd192931");
            const userIdString = (req as any).user?.id;
            const userId = userIdString ? new mongoose.Types.ObjectId(userIdString as string) : mockUserId;

            const token = (req as any).token;
            if (!token) return res.status(401).json({ error: 'Missing access token for Graph API' });

            // Fetch files from Graph
            const driveItems = await GraphService.getFiles(token);

            const seen = new Set();

            const filesToUpsert = driveItems.filter((i: any) => i.file).map((item: any) => {
                const uniqueKey = `${item.name}-${item.size}`;
                const isDuplicate = seen.has(uniqueKey);
                seen.add(uniqueKey);

                const isLargeFile = item.size > 50 * 1024 * 1024;
                const ext = item.name.split('.').pop() || 'unknown';

                return {
                    userId,
                    driveItemId: item.id,
                    fileName: item.name,
                    filePath: item.parentReference?.path || '/',
                    fileSize: item.size,
                    fileType: ext.toLowerCase(),
                    mimeType: item.file.mimeType,
                    webUrl: item.webUrl,
                    downloadUrl: item['@microsoft.graph.downloadUrl'],
                    createdAt: new Date(item.createdDateTime),
                    modifiedAt: new Date(item.lastModifiedDateTime),
                    isDuplicate,
                    isLargeFile,
                    designation: 'UNCLASSIFIED'
                };
            });

            await File.deleteMany({ userId });

            if (filesToUpsert.length > 0) {
                await File.insertMany(filesToUpsert);
            }

            res.status(200).json({ success: true, count: filesToUpsert.length });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Sync failed' });
        }
    };

    public updateDesignation = async (req: Request, res: Response) => {
        try {
            const fileId = req.params.id;
            const designation = req.body.designation;

            const file = await File.findByIdAndUpdate(
                fileId,
                { designation },
                { new: true }
            );

            if (!file) return res.status(404).json({ error: 'File not found' });

            res.status(200).json({ success: true, file: file.toJSON() });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update designation' });
        }
    };
}
