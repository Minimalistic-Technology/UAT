import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/job-portal";

async function run() {
    try {
        await mongoose.connect(uri);
        const db = mongoose.connection.db;

        // 1. Find User
        const user = await db.collection('users').findOne({ email: 'pesop11852@bncinema.com' });
        if (!user) {
            console.log("Error: User pesop11852@bncinema.com not found!");
            process.exit(1);
        }

        // 2. Find Feature
        const feature = await db.collection('features').findOne({ slug: 'dark-mode' });
        if (!feature) {
            console.log("Error: dark-mode feature not found!");
            process.exit(1);
        }

        // 3. Update Feature status to 'beta' so permissions are actually checked (if it's disabled, no one sees it)
        await db.collection('features').updateOne({ _id: feature._id }, { $set: { status: 'beta' } });
        console.log("Updated dark-mode status to 'beta'.");

        // 4. Create FeaturePermission
        // Check if permission already exists
        const existing = await db.collection('featurepermissions').findOne({ feature: feature._id, user: user._id });
        if (!existing) {
            await db.collection('featurepermissions').insertOne({
                feature: feature._id,
                user: user._id, // Assigning explicitly
                company: null, // Specific user, not global company
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`Successfully assigned beta dark-mode to User: ${user.email}`);
        } else {
            console.log(`User ${user.email} already has permission for dark-mode!`);
        }

    } catch (error) {
        console.error("Script failed:", error);
    } finally {
        process.exit(0);
    }
}
run();
