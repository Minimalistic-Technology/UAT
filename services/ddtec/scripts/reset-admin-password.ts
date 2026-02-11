
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../src/models/User';
import bcrypt from 'bcryptjs';

// Load env from correct path (../../.env relative to services/ddtec)
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
// Script is in services/ddtec/scripts -> one level up is services/ddtec -> two levels up is services -> three is UAT?
// Wait. 
// CWD is services/ddtec.
// .env is in UAT.
// UAT/services/ddtec. 
// So ../../.env.
// Let's use path.resolve from CWD.

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const resetAdmin = async () => {
    try {
        console.log('Loading env from:', path.resolve(process.cwd(), '../../.env'));
        console.log('MONGO_URI:', process.env.MONGO_URI ? 'Found' : 'Not Found');

        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI is undefined. Check .env path.');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        const email = 'admin@ddtec.com';
        const password = 'adminpassword123';

        // Find existing admin
        let user = await User.findOne({ email });

        if (user) {
            console.log('Found existing admin user.');
            user.password = password;
            await user.save();
            console.log('Admin password updated successfully.');
        } else {
            console.log('Admin user not found. Creating new one...');
            user = new User({
                name: 'System Admin',
                email,
                password,
                role: 'admin'
            });
            await user.save();
            console.log('Admin user created successfully.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error resetting admin:', error);
        process.exit(1);
    }
};

resetAdmin();
