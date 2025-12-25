const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const emailRoutes = require('./routes/emails');
const configRoutes = require('./routes/config');
const customerRoutes = require('./routes/customers');
const schedulerService = require('./services/schedulerService');

const app = express();

// CORS Configuration - IMPORTANT for frontend connection
app.use(cors({
  origin: 'https://ui-bulk-email.onrender.com',
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); // Increase limit for bulk operations
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Database connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10, // Limit connections for stability
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB');
    
    // Start scheduler after successful DB connection
    schedulerService.initScheduler();
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    console.log('Retrying in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Handle MongoDB connection errors
mongoose.connection.on('error', err => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
});

// Routes
app.use('/api/emails', emailRoutes);
app.use('/api/config', configRoutes);
app.use('/api/customers', customerRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Email Scheduler API is running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Frontend should connect to: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close();
    schedulerService.stopScheduler();
    process.exit(0);
  });
});