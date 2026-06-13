import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/job-portal";

async function run() {
    try {
        await mongoose.connect(uri);
        const db = mongoose.connection.db;

        const featureSlug = 'notification-system';

        const existing = await db.collection('features').findOne({ slug: featureSlug });
        if (!existing) {
            await db.collection('features').insertOne({
                name: "Notification System",
                slug: featureSlug,
                description: "In-app notifications",
                status: "public",
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`Added Notification feature to DB setting it to public.`);
        } else {
            // Update to public just in case
            await db.collection('features').updateOne(
                { _id: existing._id },
                { $set: { status: "public", updatedAt: new Date() } }
            );
            console.log(`Notification feature already exists. Updated to public status.`);
        }

    } catch (error) {
        console.error("Script failed:", error);
    } finally {
        process.exit(0);
    }
}
run();
