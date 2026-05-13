import express from 'express';
import { connectDatabase } from './config/db';  
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { defaultLimiter } from './config/rateLimit';
import errorHandler from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';

const app = express();

// 1. Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 3. Database Connection
(async () => {
  try {
    await connectDatabase();
  } catch (err) {
    console.error(' MongoDB connection failed', err);
    process.exit(1);
  }
})();

// 4. Rate Limiting (Security)
app.use('/api/', defaultLimiter);

// 5. Body Parsers
app.use(express.json({ limit: "10mb" })); // Reduced from 50mb for security
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 6. CORS
app.use(cors({
  origin: env.NODE_ENV === "development" ? ["http://localhost:3000", "http://127.0.0.1:3000"] : env.corsOrigins,
  credentials: true,                
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 
}));

app.use(cookieParser());

// 7. Routes
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', environment: env.NODE_ENV });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/comments', commentRoutes);

// 8. Error Handling
app.use(errorHandler);

export default app;
