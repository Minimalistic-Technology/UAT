import ExcelJS from 'exceljs';

export class ExcelService {
    public static async generateExport(files: any[], res: any) {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'OneDrive Audit Tool';
        workbook.created = new Date();

        // Sheet 1: All Files
        const allFilesSheet = workbook.addWorksheet('All Files');
        allFilesSheet.columns = [
            { header: 'File Name', key: 'fileName', width: 40 },
            { header: 'Path', key: 'filePath', width: 60 },
            { header: 'Size (mb.Bytes)', key: 'fileSizeFormatted', width: 25 },
            { header: 'Open in OneDrive (Web URL)', key: 'webUrl', width: 90 },
            { header: 'Direct Download Link', key: 'downloadUrl', width: 90 }
        ];

        // Header styling
        allFilesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        allFilesSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };

        files.forEach((file) => {
            const rawBytes = Number(file.fileSize) || 0;
            const sizeInMB = (rawBytes / (1024 * 1024)).toFixed(2);
            const formattedSize = `${sizeInMB} MB (${rawBytes} Bytes)`;

            allFilesSheet.addRow({
                fileName: file.fileName,
                filePath: file.filePath,
                fileSizeFormatted: formattedSize,
                webUrl: file.webUrl || 'N/A',
                downloadUrl: (() => {
                    // Priority: stored downloadUrl > webUrl + ?download=1 fallback
                    if (file.downloadUrl) return file.downloadUrl;
                    if (file.webUrl) {
                        try {
                            const url = new URL(file.webUrl);
                            url.searchParams.set('download', '1');
                            return url.toString();
                        } catch { return file.webUrl; }
                    }
                    return 'N/A';
                })()
            });
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=' + `OneDrive_Audit_${new Date().toISOString().slice(0, 10)}.csv`);

        await workbook.csv.write(res);
        res.end();
    }
}
