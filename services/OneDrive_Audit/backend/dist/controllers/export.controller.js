"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportController = void 0;
const File_1 = __importDefault(require("../models/File"));
const User_1 = __importDefault(require("../models/User"));
const ExportLog_1 = __importDefault(require("../models/ExportLog"));
const excel_service_1 = require("../services/excel.service");
const mongoose_1 = __importDefault(require("mongoose"));
class ExportController {
    exportExcel = async (req, res) => {
        try {
            let userId;
            // Try to get userId from authenticated token first
            const userIdString = req.user?.id;
            if (userIdString) {
                userId = new mongoose_1.default.Types.ObjectId(userIdString);
            }
            else {
                // Fallback: get the most recently active user from DB
                const latestUser = await User_1.default.findOne({}).sort({ updatedAt: -1 });
                if (!latestUser) {
                    return res.status(404).json({ error: 'No user found. Please log in first.' });
                }
                userId = latestUser._id;
            }
            const files = await File_1.default.find({ userId }).sort({ createdAt: -1 });
            if (files.length === 0) {
                return res.status(404).json({ error: 'No files found. Please sync OneDrive first.' });
            }
            const fileName = `OneDrive_Audit_${new Date().toISOString().slice(0, 10)}.csv`;
            // Log the export
            await ExportLog_1.default.create({
                userId,
                fileName,
                fileCount: files.length
            });
            // Execute stream download (files mapped to plain objects)
            await excel_service_1.ExcelService.generateExport(files.map(f => f.toJSON()), res);
        }
        catch (error) {
            console.error('Export Error:', error);
            res.status(500).json({ error: 'Failed to generate excel export' });
        }
    };
}
exports.ExportController = ExportController;
