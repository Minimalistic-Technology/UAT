import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import filesRoutes from './routes/files.routes';
import exportRoutes from './routes/export.routes';
import employeeRoutes from './routes/employee.routes';
import { connectDB } from './config/db';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — allow both local dev and production frontend
const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

import deviceAuthRoutes from './routes/device-auth.routes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/device-auth', deviceAuthRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/employee', employeeRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
