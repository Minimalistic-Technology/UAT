import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User';

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('Connected to MongoDB');

        const users = await User.find({}, 'email role isActive firstName lastName');
        console.log('Total Users:', users.length);
        console.log(JSON.stringify(users, null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkUsers();
