import mongoose from 'mongoose';
import { env } from './src/config/env';

async function approveAllPosts() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to DB');

    const result = await mongoose.connection.collection('posts').updateMany(
      { published: true }, // All posts that were already published
      { $set: { status: 'published' } }
    );
    console.log(`Updated ${result.modifiedCount} published posts to status: 'published'`);

    // Also set all remaining posts (drafts etc.) to at least have a status
    const result2 = await mongoose.connection.collection('posts').updateMany(
      { status: { $exists: false } },
      { $set: { status: 'pending' } }
    );
    console.log(`Set ${result2.modifiedCount} remaining posts to status: 'pending'`);

    console.log('All done!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

approveAllPosts();
