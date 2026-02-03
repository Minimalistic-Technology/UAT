import mongoose from 'mongoose';
import { config } from '../config/env.js';
const dropIndex = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        console.log('Connected to MongoDB');
        const collection = mongoose.connection.collection('users');
        // List indexes first
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes);
        const indexName = 'username_1';
        const indexExists = indexes.some((idx) => idx.name === indexName);
        if (indexExists) {
            await collection.dropIndex(indexName);
            console.log(`Index ${indexName} dropped successfully`);
        }
        else {
            console.log(`Index ${indexName} not found`);
        }
        process.exit(0);
    }
    catch (error) {
        console.error('Error dropping index:', error);
        process.exit(1);
    }
};
dropIndex();
