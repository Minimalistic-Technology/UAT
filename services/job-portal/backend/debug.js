import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/job-portal";

async function run() {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    const feature = await db.collection('features').findOne({ slug: 'dark-mode' });
    const user = await db.collection('users').findOne({ email: 'pesop11852@bncinema.com' });

    console.log("Feature ID:", feature?._id);
    console.log("User ID:", user?._id);

    try {
        const res1 = await fetch("http://localhost:5000/api/admin/developer/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                collectionName: "FeaturePermission",
                operation: "findOne",
                query: JSON.stringify({ feature: feature?._id, user: user?._id })
            })
        });
        console.log("FindOne:", await res1.json());
    } catch (e) {
        console.log("ERROR:", e);
    }

    process.exit();
}
run();
