require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || true, credentials: true })); // In production, provide FRONTEND_URL in .env

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/links', require('./routes/linkRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/subscribers', require('./routes/subscriberRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// Root route
app.get('/', (req, res) => {
  res.send(`${process.env.WEB_NAME || 'Infilink'} API is running...`);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
