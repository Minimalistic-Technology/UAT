import express from 'express';
import { connectDatabase } from './config/db';  
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import { env } from './config/env';
import { defaultLimiter } from './config/rateLimit';
import errorHandler from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();

// 1. CORS (Must be first for production)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (env.corsOrigins.includes(origin) || env.NODE_ENV === "development") {
      callback(null, true);
    } else {
      console.warn(`[cors] Blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,                
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  maxAge: 86400 
}));

// 2. Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 3. Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 4. Database Connection is now handled in server.ts to ensure it's ready before listening


// 5. Rate Limiting (Security)
app.use('/api/', defaultLimiter);

// 6. Body Parsers
app.use(express.json({ limit: "10mb" })); // Reduced from 50mb for security
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 7. Sanitize Data (Security - Against NoSQL Injection)
app.use(mongoSanitize());

app.use(cookieParser());

// 7. Routes
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', environment: env.NODE_ENV });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/admin', adminRoutes);

// 8. Error Handling
app.use(errorHandler);

export default app;
