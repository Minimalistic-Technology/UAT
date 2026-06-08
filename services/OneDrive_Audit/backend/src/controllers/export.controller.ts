import { Request, Response } from 'express';
import File from '../models/File';
import User from '../models/User';
import ExportLog from '../models/ExportLog';
import { ExcelService } from '../services/excel.service';
import mongoose from 'mongoose';
import Notification from '../models/Notification';
import { EmailService } from '../services/email.service';

export class ExportController {
    public exportExcel = async (req: Request, res: Response) => {
        try {
            let userId: mongoose.Types.ObjectId;

            const user = (req as any).user;
            let userIdString = user?.id;

            // If employee, use admin's drive identity
            if (user?.role === 'employee' && user?.adminId) {
                userIdString = user.adminId;
            }

            if (userIdString) {
                userId = new mongoose.Types.ObjectId(userIdString as string);
            } else {
                // Fallback: get the most recently active user from DB
                const latestUser = await User.findOne({ role: 'admin' }).sort({ updatedAt: -1 });
                if (!latestUser) {
                    return res.status(404).json({ error: 'No admin user found. Please log in first.' });
                }
                userId = latestUser._id as mongoose.Types.ObjectId;
            }

            let files = await File.find({ userId }).sort({ createdAt: -1 });

            // Apply folder filtering to simulate exporting all files under a path
            const folderPath = req.query.folder as string;
            if (folderPath && folderPath !== '/') {
                files = files.filter(f => {
                    let p = f.filePath.replace(/^\/drive\/root:?/, '');
                    if (!p || p === '') p = '/';

                    // Include any file that is within this directory or its subdirectories
                    return p === folderPath || p.startsWith(folderPath + '/');
                });
            }

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

            // NOTIFICATION LOGIC: If a restricted user (employee) exports, notify the Admin
            if (user?.role === 'employee' && user?.adminId) {
                const folderQuery = req.query.folder as string;
                const displayFolder = (!folderQuery || folderQuery === '/') ? 'Home' : folderQuery;

                await Notification.create({
                    adminId: user.adminId,
                    employeeName: user.name || user.email || 'An Employee',
                    message: `${user.name || 'An Employee'} exported a CSV report containing ${files.length} items from folder "${displayFolder}"`,
                    type: 'EXPORT'
                });

                // ALSO Dispatch an Email via BREVO
                try {
                    const adminUser = await User.findById(user.adminId);
                    if (adminUser && adminUser.email) {
                        EmailService.sendExportNotification(
                            adminUser.email,
                            user.name || user.email || 'An Employee',
                            displayFolder,
                            files.length
                        ).catch(console.error); // Fire & Forget
                    }
                } catch (e) {
                    console.error('Failed to trigger email notification logic', e);
                }
            }

            // Execute stream download (files mapped to plain objects)
            await ExcelService.generateExport(files.map(f => f.toJSON()), res);

        } catch (error) {
            console.error('Export Error:', error);
            res.status(500).json({ error: 'Failed to generate excel export' });
        }
    };
}
