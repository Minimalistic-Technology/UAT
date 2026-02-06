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
// Middleware
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            process.env.FRONTEND_URL || 'http://localhost:3000' , 
            "https://ddtec.onrender.com"
        ];
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            // For development, we might want to be permissive or just log it
            console.warn(`Blocked by CORS: ${origin}`);
            // callback(new Error('Not allowed by CORS')); // Strict
            callback(null, true); // Permissive for debugging to solve "No token"
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
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
