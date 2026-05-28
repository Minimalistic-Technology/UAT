import express, { Request, Response } from "express";
import app from "./app";
import { connectDatabase } from './config/db';
import { env } from './config/env';

import { connectMongoDB } from './config/mongodb';

const PORT = env.PORT || 5001;

app.get("/", (req: Request, res: Response) => {
  res.send("Minimalistic Learning Backend API");
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "minimalistic-learning", env: env.NODE_ENV });
});

// Server ko Database ke baad start karein
const startServer = async () => {
  try {
    await connectDatabase(); // Wait for PostgreSQL (Prisma) connection
    await connectMongoDB(); // Optional soft connection for MongoDB (Mongoose)
    app.listen(PORT, () => {
      console.log(`[server] Service listening on port ${PORT} in ${env.NODE_ENV} mode`);
      console.log(`[server] CORS origins: ${env.corsOrigins.join(', ')}`);
    });
  } catch (err) {
    console.error("Failed to start server because of DB connection:", err);
    process.exit(1);
  }
};

startServer();
