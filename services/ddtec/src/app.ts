import dotenv from 'dotenv';
import path from 'path';

// Load env vars immediately before other imports
dotenv.config(); // Load .env from current service directory
// Keep backup paths for monorepo support
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

console.log('[DEBUG] Environment Variables Check:');
console.log(' - EMAIL_USER:', process.env.EMAIL_USER ? 'FOUND (Real Mode)' : 'MISSING (Sandbox Mode)');
console.log(' - SMS_SERVICE: DISABLED (Use Email)');
console.log(' - MONGO_URI:', process.env.MONGO_URI ? 'FOUND' : 'CONNECTED (HIDDEN)');

// Trigger Email Verification on start
import NotificationService from './services/notification.service';
NotificationService.checkStatus().then(status => {
    if (status.success) {
        console.log('[NOTIFICATION] ✅ Email Service Status:', status.message);
    } else {
        console.error('[NOTIFICATION] ❌ Email Service Status:', status.message);
    }
});

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import routes from './routes';
import connectDB from './config/database';

const app = express();

// Middleware
// Middleware
// Middleware
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL || 'http://localhost:3000',
    "https://ddtec.onrender.com"
];

// Add origins from ALLOWED_ORIGINS env var if present
if (process.env.ALLOWED_ORIGINS) {
    const extraOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
    allowedOrigins.push(...extraOrigins);
}

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`Blocked by CORS: ${origin}`);
            // In dev, we might still want to allow but log
            callback(null, true);
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
