import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/models/User';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('Connected to MongoDB');

        const users = await User.find({});
        for (const user of users) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('123456789', salt);

            // Update database directly to avoid triggering other hooks if any, or just use user.save()
            await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
            console.log(`Updated password for ${user.email} (Role: ${user.role}) to '123456789'`);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456789', salt);

        // Seed admin user
        await User.updateOne(
            { email: 'admin@ddtec.com' },
            {
                $set: {
                    email: 'admin@ddtec.com',
                    password: hashedPassword,
                    role: 'admin',
                    firstName: 'Admin',
                    isActive: true,
                    isEmailVerified: true
                }
            },
            { upsert: true }
        );
        console.log("Seeded/Updated admin user admin@ddtec.com with password '123456789'");

        // Seed test user
        await User.updateOne(
            { email: 'test@ddtec.com' },
            {
                $set: {
                    email: 'test@ddtec.com',
                    password: hashedPassword,
                    role: 'user',
                    firstName: 'Test',
                    isActive: true,
                    isEmailVerified: true
                }
            },
            { upsert: true }
        );
        console.log("Seeded/Updated test user test@ddtec.com with password '123456789'");

        // Seed warehouse user
        await User.updateOne(
            { email: 'warehouse@ddtec.com' },
            {
                $set: {
                    email: 'warehouse@ddtec.com',
                    password: hashedPassword,
                    role: 'warehouse',
                    firstName: 'Warehouse',
                    lastName: 'Manager',
                    isActive: true,
                    isEmailVerified: true
                }
            },
            { upsert: true }
        );
        console.log("Seeded/Updated warehouse user warehouse@ddtec.com with password '123456789'");

        console.log("Password reset and user creation complete.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
