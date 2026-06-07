import mongoose from "mongoose";
import { connectDB } from "../config/database.js";
import Feature, { FeatureStatus } from "../models/Feature.model.js";
import FeaturePermission from "../models/FeaturePermission.model.js";
import User from "../models/User.model.js";
import { config } from "dotenv";

config();

const seedFeatures = async () => {
    await connectDB();
    console.log("Connected to DB, initializing features...");

    // 1. Create Base Features
    const features = await Feature.insertMany([
        {
            name: "AI Admin Assistant",
            slug: "ai-admin-bot",
            description: "AI powered admin assistant chatbot.",
            status: FeatureStatus.BETA, // Keep it beta so we can test table permissions
        },
        {
            name: "Premium Analytics Dashboard",
            slug: "premium-analytics",
            description: "Advanced analytics for employers.",
            status: FeatureStatus.DISABLED, // Disabled for everyone
        },
        {
            name: "Dark Mode",
            slug: "dark-mode",
            description: "Toggle UI dark mode.",
            status: FeatureStatus.PUBLIC, // Public for everyone
        },
    ]);

    console.log("Features created:", features.map(f => f.slug));

    // 2. Assign the "BETA" feature to the first user found in the DB
    const firstUser = await User.findOne();
    if (firstUser) {
        const aiChatFeature = features.find(f => f.slug === "ai-chat-beta");

        await FeaturePermission.create({
            feature: aiChatFeature?._id,
            user: firstUser._id,
        });
        console.log(`Granted 'ai-chat-beta' exclusively to User: ${firstUser.email}`);
    }

    process.exit();
};

seedFeatures().catch(console.error);
