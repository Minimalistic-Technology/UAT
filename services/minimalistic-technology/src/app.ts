import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import errorMiddleware from "./middleware/errorMiddleware";
import teamRoutes from "./routes/teams/teamRoutes";



dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());

app.use("/api/team", teamRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Minimalistic Technology main site");
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "minimalistic-Technology" });
});

app.use(errorMiddleware);


export default app;