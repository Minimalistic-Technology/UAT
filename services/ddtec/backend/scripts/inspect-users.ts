import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const inspectUsers = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error("❌ MONGO_URI not found in env!");
            return;
        }

        console.log("Connecting to Database...");
        await mongoose.connect(uri);
        console.log("✅ Connected Successfully!");

        // Define a simple Schema
        const UserSchema = new mongoose.Schema({}, { strict: false });
        const User = mongoose.models.User || mongoose.model('User', UserSchema, 'users');

        const users = await User.find({}, 'name email role password');

        if (users.length === 0) {
            console.log("\n⚠️ No users found in this database!");
        } else {
            console.log(`\n👥 Found ${users.length} Users in database:\n`);
            users.forEach((user: any, index: number) => {
                console.log(`${index + 1}. Name: ${user.get('name') || 'N/A'}`);
                console.log(`   Email: ${user.get('email')}`);
                console.log(`   Role: ${user.get('role')}`);
                console.log(`   Password (hashed): ${user.get('password')}\n`);
            });
        }

        await mongoose.connection.close();
        console.log("Database connection closed.");
    } catch (error) {
        console.error("❌ Error inspecting users:", error);
    }
};

inspectUsers();
