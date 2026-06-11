import { Request, Response } from 'express';
import File from '../models/File';
import User from '../models/User';
import { GraphService } from '../services/graph.service';
import mongoose from 'mongoose';

export class FilesController {

    public getFiles = async (req: Request, res: Response) => {
        try {
            const user = (req as any).user;
            let userIdString = user?.id;

            // If the user is an employee, use their admin's ID to fetch the files
            if (user?.role === 'employee' && user?.adminId) {
                userIdString = user.adminId;
            }

            const mockUserId = new mongoose.Types.ObjectId("664f33190a424260bd192931");
            const userId = userIdString ? new mongoose.Types.ObjectId(userIdString as string) : mockUserId;

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;

            const files = await File.find({ userId })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            const total = await File.countDocuments({ userId });
            const storageAgg = await File.aggregate([
                { $match: { userId, fileType: { $ne: 'folder' } } },
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
            const user = (req as any).user;
            let targetUserIdString = user?.id;
            let token = (req as any).token;

            // If employee, sync from their admin's Microsoft identity
            if (user?.role === 'employee' && user?.adminId) {
                targetUserIdString = user.adminId;
                const adminUser = await User.findById(user.adminId);
                if (!adminUser || !adminUser.accessToken) {
                    return res.status(403).json({ error: 'Cannot sync: Admin has no active Microsoft connection.' });
                }
                token = adminUser.accessToken;
            }

            const mockUserId = new mongoose.Types.ObjectId("664f33190a424260bd192931");
            const userId = targetUserIdString ? new mongoose.Types.ObjectId(targetUserIdString as string) : mockUserId;

            if (!token) return res.status(401).json({ error: 'Missing access token for Graph API' });

            // Fetch files from Graph
            const driveItems = await GraphService.getFiles(token);

            const seen = new Set();

            const filesToUpsert = driveItems.filter((i: any) => !i.deleted).map((item: any) => {
                const uniqueKey = `${item.id}`; // using item.id directly to be absolutely safe
                const isDuplicate = seen.has(uniqueKey);
                seen.add(uniqueKey);

                const isLargeFile = item.size > 50 * 1024 * 1024;
                const isFolder = !!item.folder;
                const ext = isFolder ? 'folder' : (item.name.split('.').pop() || 'unknown');

                return {
                    userId,
                    driveItemId: item.id,
                    fileName: item.name,
                    filePath: item.parentReference?.path || '/',
                    fileSize: item.size || 0,
                    fileType: ext.toLowerCase(),
                    mimeType: isFolder ? 'application/vnd.microsoft.folder' : item.file?.mimeType,
                    webUrl: item.webUrl,
                    downloadUrl: item['@microsoft.graph.downloadUrl'] || null,
                    createdAt: new Date(item.createdDateTime || Date.now()),
                    modifiedAt: new Date(item.lastModifiedDateTime || Date.now()),
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
        } catch (error: any) {
            console.error(error);
            if (error?.status === 401 || error?.response?.status === 401) {
                return res.status(401).json({ error: 'Microsoft Token Expired. Please login again.' });
            }
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
