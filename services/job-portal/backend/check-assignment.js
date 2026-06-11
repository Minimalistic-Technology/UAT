import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/job-portal";

async function run() {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    const feature = await db.collection('features').findOne({ slug: 'dark-mode' });
    if (!feature) {
        console.log("Dark mode feature not found");
        process.exit();
    }

    const permissions = await db.collection('featurepermissions').find({ feature: feature._id }).toArray();

    if (permissions.length === 0) {
        console.log("No users are assigned this feature");
    } else {
        for (const perm of permissions) {
            const user = await db.collection('users').findOne({ _id: perm.user });
            console.log(`Assigned to User: ${user?.email || perm.user}`);
        }
    }

    process.exit();
}
run();
