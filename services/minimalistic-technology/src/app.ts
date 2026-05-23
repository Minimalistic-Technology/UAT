import express, { Request, Response } from "express";
import cors from "cors";
import errorMiddleware from "./middleware/errorMiddleware";
import teamRoutes from "./routes/teams/teamRoutes";
import mailRoutes from "./routes/mail/mailRoutes";
import { rateLimit } from "express-rate-limit";

const app = express();

app.use(cors({
  origin: "https://minimalistic-technology.onrender.com",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please slow down.",
    });
  },
});

app.use(limiter);

app.use("/api/team", teamRoutes);
app.use("/api", mailRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Minimalistic Technology main site");
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "minimalistic-Technology" });
});

app.use(errorMiddleware);

export default app;
