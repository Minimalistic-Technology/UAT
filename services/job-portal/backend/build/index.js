import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { connectDB } from './config/database.js';
import { config } from './config/env.js';
import { generalLimiter } from './middleware/rateLimiter.js';
// Import routes
import authRoutes from './routes/auth.routes.js';
import jobRoutes from './routes/job.routes.js';
import applicationRoutes from './routes/application.routes.js';
import userRoutes from './routes/user.routes.js';
import companyRoutes from './routes/company.routes.js';
import adminRoutes from "./routes/admin.route.js";
import companyMemberRoutes from './routes/companyMember.routes.js';
// Initialize express app
const app = express();
// Connect to database
connectDB();
app.set('trust proxy', 1);
// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: config.clientUrl,
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
// Sanitize data
// app.use(sanitizeInput);
// Rate limiting
app.use('/api', generalLimiter);
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/company-members", companyMemberRoutes);
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
    });
});
// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Server Error',
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});
// Start server
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
