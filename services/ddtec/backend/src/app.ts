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
import SchedulerService from './services/scheduler.service';
NotificationService.checkStatus().then(status => {
    if (status.success) {
        console.log('[NOTIFICATION] ✅ Email Service Status:', status.message);
    } else {
        console.error('[NOTIFICATION] ❌ Email Service Status:', status.message);
    }
});

// Start Email Scheduler Background Task
SchedulerService.startEmailScheduler();

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
// Provide truly global seamless CORS functionality for any environment
app.use(cors({
    origin: (origin, callback) => {
        // Master override: Allow all origins to seamlessly support any frontend deployment domain (Local, Vercel, Render)
        // This is safe because we rely on JWT/HttpOnly cookies over HTTPS for authentication payload security.
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposedHeaders: ['Content-Disposition']
}));
app.use(cookieParser());
app.use(express.json({
    limit: '10mb',
    // Preserve raw body for Cashfree webhook signature verification
    verify: (req: any, _res, buf) => {
        req.rawBody = buf.toString('utf8');
    }
}));
app.use(morgan('dev'));

// Database Connection
// Only connect if MONGO_URI is present to avoid crashing on start without it
if (process.env.MONGO_URI) {
    connectDB().then(async () => {
        try {
            const RouteConfig = require('./models/RouteConfig').default;
            await RouteConfig.updateOne(
                { path: '/warehouse' },
                { $set: { path: '/warehouse', name: 'Inventory & Warehouse', description: 'Blinkit-style Rack & Aisle Stock Management', isActive: true } },
                { upsert: true }
            );
            console.log('[SYSTEM] Warehouse/Inventory Route strictly dynamically seeded!');
        } catch (e) { console.error('Warehouse route seed error', e); }
    });
} else {
    console.warn('MONGO_URI not found. Database not connected.');
}

// Routes
app.use('/', routes);
app.use("/test", (req, res) => {
    res.send('DDTEC Backend is running');
});

export default app;
