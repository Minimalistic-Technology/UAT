import mongoose from 'mongoose';
import { env } from './env';

export const connectMongoDB = async () => {
    // Gracefully skip MongoDB connection if it's not setup yet, to not break existing PostgreSQL logic.
    if (!env.MONGO_URI || env.MONGO_URI === 'mongodb://localhost:27017/placeholder' || env.MONGO_URI === '') {
        console.log('[MongoDB] URI not configured or using placeholder. Skipping MongoDB connection...');
        return;
    }

    try {
        const conn = await mongoose.connect(env.MONGO_URI);
        console.log(`[MongoDB] Connected safely to: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[MongoDB] Connection error:`, error);
        // DO NOT exit process to ensure PostgreSQL can still run perfectly.
    }
};
