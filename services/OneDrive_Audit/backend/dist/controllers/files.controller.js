"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesController = void 0;
const File_1 = __importDefault(require("../models/File"));
const graph_service_1 = require("../services/graph.service");
const mongoose_1 = __importDefault(require("mongoose"));
class FilesController {
    getFiles = async (req, res) => {
        try {
            // Mocking user for now (in real app, use req.user.id)
            const mockUserId = new mongoose_1.default.Types.ObjectId("664f33190a424260bd192931");
            const userIdString = req.user?.id;
            const userId = userIdString ? new mongoose_1.default.Types.ObjectId(userIdString) : mockUserId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const files = await File_1.default.find({ userId })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);
            const total = await File_1.default.countDocuments({ userId });
            const storageAgg = await File_1.default.aggregate([
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
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch files' });
        }
    };
    syncFiles = async (req, res) => {
        try {
            // Mocking user (In real app, extract from token and check in DB)
            const mockUserId = new mongoose_1.default.Types.ObjectId("664f33190a424260bd192931");
            const userIdString = req.user?.id;
            const userId = userIdString ? new mongoose_1.default.Types.ObjectId(userIdString) : mockUserId;
            const token = req.token;
            if (!token)
                return res.status(401).json({ error: 'Missing access token for Graph API' });
            // Fetch files from Graph
            const driveItems = await graph_service_1.GraphService.getFiles(token);
            const seen = new Set();
            const filesToUpsert = driveItems.filter((i) => i.file).map((item) => {
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
            await File_1.default.deleteMany({ userId });
            if (filesToUpsert.length > 0) {
                await File_1.default.insertMany(filesToUpsert);
            }
            res.status(200).json({ success: true, count: filesToUpsert.length });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Sync failed' });
        }
    };
    updateDesignation = async (req, res) => {
        try {
            const fileId = req.params.id;
            const designation = req.body.designation;
            const file = await File_1.default.findByIdAndUpdate(fileId, { designation }, { new: true });
            if (!file)
                return res.status(404).json({ error: 'File not found' });
            res.status(200).json({ success: true, file: file.toJSON() });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update designation' });
        }
    };
}
exports.FilesController = FilesController;
