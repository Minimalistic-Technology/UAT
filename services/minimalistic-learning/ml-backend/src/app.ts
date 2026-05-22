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
import adminRoutes from './routes/adminRoutes';
import notificationRoutes from './routes/notificationRoutes';
import publicRoutes from './routes/publicRoutes';

const app = express();

// 1. Trust Proxy (REQUIRED for Render/Vercel to handle HTTPS/Secure cookies correctly)
app.set('trust proxy', 1);

// 2. CORS (Must be first for production)
const allowedOrigins = env.corsOrigins;
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || env.NODE_ENV === "development") {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  maxAge: 86400
}));

// 2. Security Headers
import compression from 'compression';
// 4. Compression for responses
app.use(compression());

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 3. Logging
import logger from './utils/logger';
app.use((req, res, next) => {
  logger.debug(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 4. Database Connection is now handled in server.ts to ensure it's ready before listening


// 5. Rate Limiting (Security)
app.use('/api/', defaultLimiter);

// 6. Body Parsers (reduced limits for security)
app.use(express.json({ limit: "2mb" })); // Reduced from 10mb
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.use(cookieParser());

// 7. Routes
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', environment: env.NODE_ENV });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/public', publicRoutes);

// 8. Error Handling
app.use(errorHandler);

export default app;
