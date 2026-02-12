import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dbUrl: string = process.env.MONGO_URI || "";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(dbUrl);
    console.log(`Database connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("DB connection failed. Retrying in 5s...");
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;