import express from 'express';
import helmet from 'helmet';
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

app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin: 'https://minimalistic-learning.onrender.com',
    credentials: true
  })
);
app.use(cookieParser(env.COOKIE_SECRET));
app.use(express.json());
app.use(defaultLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1', authRoutes);
app.use('/api/v1', postRoutes);
app.use('/api/v1', commentRoutes);

app.use(errorHandler);

export default app;


