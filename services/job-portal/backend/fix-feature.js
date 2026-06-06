import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/job-portal";

async function run() {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    const feature = await db.collection('features').findOne({ slug: 'dark-mode' });
    console.log("Current status:", feature?.status);

    if (feature?.status === 'public') {
        await db.collection('features').updateOne({ slug: 'dark-mode' }, { $set: { status: 'disabled' } });
        console.log("Updated status to disabled!");
    }
    process.exit();
}
run();
