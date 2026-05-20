import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config();

const debug = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error("No MONGO_URI");
            return;
        }
        await mongoose.connect(uri);
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

        const users = await User.find({}, 'email role password');
        console.log("--- EXACT DATABASE USERS ---");
        users.forEach((u: any) => {
            console.log(JSON.stringify({
                id: u._id,
                email: u.get('email'),
                role: u.get('role'),
                hasPassword: !!u.get('password'),
                emailLen: u.get('email')?.length,
                emailTrimLen: u.get('email')?.trim()?.length
            }, null, 2));
        });

        await mongoose.connection.close();
    } catch (e) {
        console.error(e);
    }
};

debug();
