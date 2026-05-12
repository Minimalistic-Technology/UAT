import mongoose from 'mongoose';
import { env } from './env';

const MONGO_URI = env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('Please define MONGO_URI in env');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  };
}

export const connectDatabase = async (retries = 5) => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000, // Increase timeout to 15s for slow DNS
      connectTimeoutMS: 15000,
      family: 4, // Force IPv4 to avoid some DNS resolution issues
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      console.log('[db] Connected to MongoDB Successfully');
      return mongoose;
    }).catch(async (err) => {
      if (retries > 0) {
        console.warn(`[db] Connection failed, retrying... (${retries} left). Error: ${err.message}`);
        cached.promise = null;
        await new Promise(res => setTimeout(res, 3000)); // Wait 3s before retry
        return connectDatabase(retries - 1);
      }
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  
  return cached.conn;
};
