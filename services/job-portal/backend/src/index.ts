import express from 'express';
import type { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { connectDB } from './config/database.js';
import { config } from './config/env.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { sanitizeInput } from './middleware/sanitize.middleware.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import jobRoutes from './routes/job.routes.js';
import applicationRoutes from './routes/application.routes.js';
import userRoutes from './routes/user.routes.js';
import companyRoutes from './routes/company.routes.js';
import adminRoutes from "./routes/admin.route.js";
import companyMemberRoutes from './routes/companyMember.routes.js';
import planRoutes from './routes/plan.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import paymentRoutes from './routes/payment.route.js';
import { ApiResponse } from './utils/apiResponse.js';
import { handleRazorpayWebhook } from './controllers/payment.controller.js';

// Initialize express app
const app: Application = express();

// Connect to database
connectDB();

app.set('trust proxy', 1);
// Middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhook/razorpay') {
    next(); // Skip JSON parsing for the webhook route
  } else {
    express.json({limit: "10mb"})(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Sanitize data
// app.use(sanitizeInput);

// Rate limiting
app.use('/api', generalLimiter);

app.post(
  '/api/webhook/razorpay', 
  express.raw({ type: 'application/json' }), 
  handleRazorpayWebhook
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/company-members", companyMemberRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json(new ApiResponse(200, null, "Server is running"));
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
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