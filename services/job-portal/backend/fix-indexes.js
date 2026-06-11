import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/job-portal";

async function run() {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    try {
        // Remove all specific null records that my script inserted incorrectly
        await db.collection('featurepermissions').updateMany(
            { company: null },
            { $unset: { company: 1 } }
        );
        await db.collection('featurepermissions').updateMany(
            { user: null },
            { $unset: { user: 1 } }
        );

        // Drop the old buggy indexes
        await db.collection('featurepermissions').dropIndex('feature_1_company_1');
        await db.collection('featurepermissions').dropIndex('feature_1_user_1');
        console.log("Indexes dropped successfully");
    } catch (e) {
        console.log("Indexes dropping error:", e);
    }

    // Create new correct partial indexes ensuring nulls/missing don't collide
    try {
        await db.collection('featurepermissions').createIndex(
            { feature: 1, company: 1 },
            { unique: true, partialFilterExpression: { company: { $exists: true, $type: "objectId" } } }
        );
        await db.collection('featurepermissions').createIndex(
            { feature: 1, user: 1 },
            { unique: true, partialFilterExpression: { user: { $exists: true, $type: "objectId" } } }
        );
        console.log("Partial indexes created successfully!");
    } catch (e) {
        console.log("Index creating error:", e);
    }

    process.exit();
}
run();
