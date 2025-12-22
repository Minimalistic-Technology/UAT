import express from 'express';
import { connectDatabase } from './config/db';  
// import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes';
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
    origin: 'https://minimalistic-learning.onrender.com', 
    credentials: true,                
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1', authRoutes);
app.use('/api/v1', postRoutes);
app.use('/api/v1', commentRoutes);

app.use(errorHandler);

export default app;


