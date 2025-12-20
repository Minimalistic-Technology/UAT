require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { rateLimit } from "express-rate-limit";
import errorMiddleware from "./middleware/error";

import adminAuthRoutes from "./routes/adminAuthRoutes";
import questionBankRoutes from "./routes/questionBankRoutes";
import questionRoutes from "./routes/questionRoutes";
import mediaAssetRoutes from "./routes/mediaAssetRoutes";
import ageContentRoutes from "./routes/ageContentRoutes";
import pinRoutes from "./routes/pinRoutes";
import gameConfigRoutes from './routes/gameConfigRoutes';
import userRoutes from './routes/userRoutes';
import gameRoutes from './routes/gameRoutes';

export const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',  
    credentials: true,                
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  }));

const limiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 1000, 
  standardHeaders: true,
  legacyHeaders: false,
  handler: function (req, res, next) {
    setTimeout(() => {
      next();
    }, 5000); 
  },
});
app.use(limiter);
export { limiter };

app.use("/auth", adminAuthRoutes);
app.use("/api/questions", questionBankRoutes);
app.use("/api", questionRoutes);
app.use("/api/media", mediaAssetRoutes);
app.use("/api/age-content", ageContentRoutes);
app.use("/api/pin", pinRoutes);
app.use("/api/v1/game-config", gameConfigRoutes);
app.use("/api/users", userRoutes);
app.use("/api/game", gameRoutes);


app.get("/test", async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "GET API is working",
  });
});

app.get("/test-db", async (req: Request, res: Response) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.status(200).json({ message: "MongoDB is connected" });
  } catch (err) {
    res.status(500).json({ error: "MongoDB connection failed", details: err });
  }
});

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(errorMiddleware);

export default app;
