import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import teamRoutes from "./routes/teams/teamRoutes";
import connectDB from "./utils/db";

dotenv.config();

const app = express();

const MONGO_URI = process.env.MONGO_URI ||  "";

app.use(cors());
app.use(express.json());

app.use("/api", teamRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Minimalistic Technology main site");
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "minimalistic-Technology" });
});


connectDB(MONGO_URI);

export default app;