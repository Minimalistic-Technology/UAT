
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
import mongoose from "mongoose";
import Admin from "../models/Admin";

const run = async () => {
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI is missing in .env");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        const targetEmail = process.argv[2];

        if (targetEmail) {
            const admin = await Admin.findOne({ email: targetEmail });
            if (!admin) {
                console.log(`User with email ${targetEmail} not found.`);
            } else {
                admin.role = "admin";
                await admin.save();
                console.log(`SUCCESS: User ${targetEmail} is now an ADMIN.`);
            }
        } else {
            console.log("\n--- Current Users ---");
            const admins = await Admin.find({});
            admins.forEach(a => {
                console.log(`- ${a.email} [${a.role}]`);
            });
            console.log("\nUsage: npx ts-node scripts/fix_admin_role.ts <email_to_promote>");
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

run();
