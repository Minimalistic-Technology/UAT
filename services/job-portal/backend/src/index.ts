import express from 'express';
import type { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { connectDB } from './config/database.js';
// Trigger nodemon restart to clear rate limiter RAM
import { config } from './config/env.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { sanitizeInput } from './middleware/sanitize.middleware.js';
import { ApiResponse } from './utils/apiResponse.js';
import { handleRazorpayWebhook } from './controllers/payment.controller.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import jobRoutes from './routes/job.routes.js';
import internshipRoutes from './routes/internship.route.js';
import applicationRoutes from './routes/application.routes.js';
import userRoutes from './routes/user.routes.js';
import companyRoutes from './routes/company.routes.js';
import adminRoutes from "./routes/admin.route.js";
import companyMemberRoutes from './routes/companyMember.routes.js';
import planRoutes from './routes/plan.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import paymentRoutes from './routes/payment.route.js';
import subscriptionRoutes from './routes/subscription.route.js';
import demoRoutes from './routes/demo.routes.js';
import listingRoutes from './routes/listing.routes.js';
import developerRoutes from './routes/developer.route.js';
import featureRoutes from './routes/feature.route.js';
import aiRoutes from './routes/ai.routes.js';
import testimonialRoutes from './routes/testimonial.routes.js';
import notificationRoutes from './routes/notification.routes.js';

// Graphql imports
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from '@as-integrations/express5';
import { typeDefs, resolvers } from "./graphql/index.js";
import { createContext } from "./graphql/context.js";

const app: Application = express();
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
  csrfPrevention: false,
});
const PORT = config.port;

if (process.env.NODE_ENV !== "test") {
  connectDB();
}

app.set('trust proxy', 1);

// Middlewares
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);
const jsonParser = express.json({ limit: "10mb" });
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhook/razorpay') {
    next(); // Skip JSON parsing for the webhook route
  } else {
    jsonParser(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Sanitize data
// app.use(sanitizeInput);

// General Rate limiter for all routes
app.use('/api', generalLimiter);

app.post(
  '/api/webhook/razorpay',
  express.raw({ type: 'application/json' }),
  handleRazorpayWebhook
);

// NOTE: Add a general rate-limter for graphql routes too
await apolloServer.start();
app.use("/graphql", expressMiddleware(apolloServer, {
  context: createContext
}))

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use("/api/internships", internshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/developer", developerRoutes);
app.use("/api/company-members", companyMemberRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/demo", demoRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/features", featureRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const status = isDbConnected ? 'operational' : 'degraded';

  res.status(isDbConnected ? 200 : 503).json(new ApiResponse(
    isDbConnected ? 200 : 503,
    {
      server: 'operational',
      database: isDbConnected ? 'operational' : 'disconnected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    },
    `System is ${status}`
  ));
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  if (statusCode >= 500) {
    console.error(err.stack);
  } else {
    console.warn(`[API Error ${statusCode}]: ${err.message}`);
  }

  res.status(statusCode).json({
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

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export { app };

