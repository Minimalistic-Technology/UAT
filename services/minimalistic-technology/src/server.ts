import express, { Request, Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import teamRoutes from "./routes/teams/teamRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/minimalistic-technology";

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", teamRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Minimalistic Technology main site");
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "minimalistic-Technology" });
});


mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

  app.listen(PORT, () => {
      console.log(`Minimalistic Technology service listening on port ${PORT}`);
    });
