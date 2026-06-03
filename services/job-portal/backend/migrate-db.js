import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = "mongodb+srv://rajmane84:rajmane123@cluster0.7dqgvr5.mongodb.net/job-portal?retryWrites=true&w=majority";

const migrate = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;

    const jobResult = await db.collection('applications').updateMany(
      { listingType: 'Job' },
      { $set: { listingType: 'job' } }
    );
    console.log(`Reverted ${jobResult.modifiedCount} applications with listingType 'Job' to 'job'`);

    const internshipResult = await db.collection('applications').updateMany(
      { listingType: 'Internship' },
      { $set: { listingType: 'internship' } }
    );
    console.log(`Reverted ${internshipResult.modifiedCount} applications with listingType 'Internship' to 'internship'`);

    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrate();
