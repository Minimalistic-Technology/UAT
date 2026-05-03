import express from 'express';
import { connectDatabase } from './config/db';  
// import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { defaultLimiter } from './config/rateLimit';
import errorHandler from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';

const app = express();

(async () => {
  try {
    await connectDatabase();
  } catch (err) {
    console.error(' MongoDB connection failed', err);
    process.exit(1);
  }
})();

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(cors({
    origin: env.NODE_ENV === "development" ? "http://localhost:3000" : env.corsOrigins,
    credentials: true,                
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/comments', commentRoutes);

app.use(errorHandler);

export default app;


