import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import cors from "cors";

// route imports
import V1Router from "./routes/v1/route";

// middlewares
import { apiLimiter } from "./middleware/ratelimiter.middleware";
import { ApiError } from "./utils/apiError";
import { corsOptions } from "./constants";
import { connectDB } from "./utils/connectDB";

const app = express();
const PORT = env.PORT;

connectDB(env.DATABASE_URL);

app.set("trust proxy", 1);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser(env.COOKIE_SECRET));
app.use(cors(corsOptions));

app.use("/api/v1", apiLimiter, V1Router);

// Route not found
app.use((req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// Error handler
app.use((err: any, req: Request, res: Response) => {
  console.error(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      data: err.data,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    errors: [],
    data: null,
  });
});

app.listen(PORT, () => {
  console.log(`Server started on PORT: ${PORT}`);
});
