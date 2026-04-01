import mongoose from 'mongoose';
import User from './src/models/User';
import { env } from './src/config/env';

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/uat');
        console.log('Connected to DB');
        const count = await User.countDocuments();
        console.log('Total users:', count);
        const users = await User.find().limit(5);
        users.forEach(u => console.log('User:', u.email));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
