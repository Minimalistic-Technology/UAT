import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import routes from './routes';
import connectDB from './config/database';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();

// Middleware
// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));

// Database Connection
// Only connect if MONGO_URI is present to avoid crashing on start without it
if (process.env.MONGO_URI) {
    connectDB();
} else {
    console.warn('MONGO_URI not found. Database not connected.');
}

// Routes
app.use('/', routes);

export default app;
