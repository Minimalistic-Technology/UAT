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

export const connectDatabase = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI).then((mongoose) => {
      console.log('[db] Connected to MongoDB');
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
