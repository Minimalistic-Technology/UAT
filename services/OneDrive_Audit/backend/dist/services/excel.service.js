"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelService = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
class ExcelService {
    static async generateExport(files, res) {
        const workbook = new exceljs_1.default.Workbook();
        workbook.creator = 'OneDrive Audit Tool';
        workbook.created = new Date();
        // Sheet 1: All Files
        const allFilesSheet = workbook.addWorksheet('All Files');
        allFilesSheet.columns = [
            { header: 'File Name', key: 'fileName', width: 40 },
            { header: 'Path', key: 'filePath', width: 60 },
            { header: 'Size (Bytes)', key: 'fileSize', width: 15 },
            { header: 'Extension / Type', key: 'fileType', width: 20 },
            { header: 'Creation Date', key: 'createdAt', width: 25 },
            { header: 'Modification Date', key: 'modifiedAt', width: 25 },
            { header: 'Classification', key: 'designation', width: 20 },
            { header: 'Is Duplicate', key: 'isDuplicate', width: 15 },
            { header: 'Is Large File', key: 'isLargeFile', width: 15 },
            { header: 'Open in OneDrive (Web URL)', key: 'webUrl', width: 90 },
            { header: 'Direct Download Link', key: 'downloadUrl', width: 90 },
            { header: 'System ID', key: 'driveItemId', width: 40 }
        ];
        // Header styling
        allFilesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        allFilesSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
        files.forEach((file) => {
            const row = allFilesSheet.addRow({
                fileName: file.fileName,
                filePath: file.filePath,
                fileSize: Number(file.fileSize),
                fileType: file.fileType,
                createdAt: file.createdAt,
                modifiedAt: file.modifiedAt,
                designation: file.designation,
                isDuplicate: file.isDuplicate ? 'Yes' : 'No',
                isLargeFile: file.isLargeFile ? 'Yes' : 'No',
                webUrl: file.webUrl || 'N/A',
                downloadUrl: (() => {
                    // Priority: stored downloadUrl > webUrl + ?download=1 fallback
                    if (file.downloadUrl)
                        return file.downloadUrl;
                    if (file.webUrl) {
                        // Convert OneDrive webUrl to a direct download link
                        try {
                            const url = new URL(file.webUrl);
                            url.searchParams.set('download', '1');
                            return url.toString();
                        }
                        catch {
                            return file.webUrl;
                        }
                    }
                    return 'N/A';
                })(),
                driveItemId: file.driveItemId || 'N/A'
            });
            // Highlight duplicates in Yellow
            if (file.isDuplicate) {
                row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
            }
            // Highlight high/critical in Red
            if (file.designation === 'CRITICAL' || file.designation === 'HIGH') {
                row.font = { color: { argb: 'FFDC2626' }, bold: true };
            }
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=' + `OneDrive_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
        await workbook.csv.write(res);
        res.end();
    }
}
exports.ExcelService = ExcelService;
