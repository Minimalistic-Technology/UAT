import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import { GraphService } from './src/services/graph.service';
import User from './src/models/User';
import File from './src/models/File';

dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        const user = await User.findOne({}).sort({ createdAt: -1 });

        if (!user) {
            console.log("No user found in DB!");
            return;
        }

        console.log("Found user:", user.email, user.name);
        const token = user.accessToken;
        console.log("Attempting to fetch from Graph API...");

        let driveItems;
        try {
            driveItems = await GraphService.getFiles(token);
            console.log(`Fetched ${driveItems.length} items from Graph API.`);
        } catch (e: any) {
            console.error("GRAPH API ERROR:", e.message);
            try {
                await axios.get('https://graph.microsoft.com/v1.0/me/drive/root/search(q=\'\')', {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (axiosErr: any) {
                console.error("AXIOS FULL ERROR:", JSON.stringify(axiosErr.response?.data, null, 2));
            }
            process.exit(1);
        }

        console.log("Mapping items to File models...");
        const seen = new Set();
        const filesToUpsert = driveItems.filter((i: any) => i.file).map((item: any) => {
            const uniqueKey = `${item.name}-${item.size}`;
            const isDuplicate = seen.has(uniqueKey);
            seen.add(uniqueKey);

            const isLargeFile = item.size > 50 * 1024 * 1024;
            const ext = item.name.split('.').pop() || 'unknown';

            return {
                userId: user._id,
                driveItemId: item.id,
                fileName: item.name,
                filePath: item.parentReference?.path || '/',
                fileSize: item.size,
                fileType: ext.toLowerCase(),
                mimeType: item.file?.mimeType,
                webUrl: item.webUrl,
                createdAt: new Date(item.createdDateTime),
                modifiedAt: new Date(item.lastModifiedDateTime),
                isDuplicate,
                isLargeFile,
                designation: 'UNCLASSIFIED'
            };
        });

        console.log(`Attempting to validate ${filesToUpsert.length} files in Mongoose...`);
        let hasValidationError = false;
        for (const fileData of filesToUpsert) {
            const doc = new File(fileData);
            const err = doc.validateSync();
            if (err) {
                console.error("VALIDATION ERROR mapped item:", err.message);
                hasValidationError = true;
                break;
            }
        }

        if (!hasValidationError && filesToUpsert.length > 0) {
            await File.deleteMany({ userId: user._id });
            await File.insertMany(filesToUpsert);
            console.log("Insert success!");
        }

    } catch (e) {
        console.error("UNEXPECTED ERROR:", e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
