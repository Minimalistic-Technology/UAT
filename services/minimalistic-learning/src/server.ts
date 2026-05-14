import express, { Request, Response } from "express";
import app from "./app";
import { connectDatabase } from './config/db';

const PORT = process.env.PORT || 5001;

app.get("/", (req: Request, res: Response) => {
  res.send("Minimalistic Learning main site");
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "minimalistic-learning" });
});

// Server ko Database ke baad start karein
const startServer = async () => {
  try {
    await connectDatabase(); // Wait for DB connection
    app.listen(PORT, () => {
      console.log(`Minimalistic Learning service listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server because of DB connection:", err);
    process.exit(1);
  }
};

startServer();
