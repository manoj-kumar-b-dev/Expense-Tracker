/**
 * @file server.js
 * @description Main entry point for MERN Expense Tracker server. Configures security, requests, database, routing tables, and server lifecycle.
 * 
 * This file now supports both traditional server deployment and Vercel serverless deployment.
 * - For traditional deployment: Run directly with `node server.js` or `npm start`
 * - For Vercel deployment: This app is exported and imported by api/index.js
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const exportRoutes = require('./routes/export');
const budgetRoutes = require('./routes/budgetRoutes');
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const currencyRoutes = require('./routes/currency');
const recurringRoutes = require('./routes/recurring');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// 1. HTTP Security headers (Helmet)
app.use(helmet());

// 2. Logger (Morgan) in dev environment
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 3. CORS configuration
// Allow credentials (cookies) and configure origins dynamically based on environment
const allowedOrigins = [];

if (process.env.FRONTEND_URL) {
  // Support multiple comma-separated frontend URLs if needed
  const origins = process.env.FRONTEND_URL.split(',').map(url => url.trim());
  allowedOrigins.push(...origins);
}

// In development, also allow local React development server origins
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push(
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5175'
  );
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.includes(origin);
    // Dynamically allow Vercel deployments
    const isVercel = origin.endsWith('.vercel.app');

    if (isAllowed || isVercel) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// 4. JSON Body Parser (Increase limit for Base64 profile picture uploads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Root status checking route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Expense Tracker API is healthy and operational',
    timestamp: new Date(),
    environment: process.env.VERCEL ? 'vercel-serverless' : 'traditional'
  });
});

// 6. Mount Routers
app.use('/api/auth', authRoutes);
app.use('/api/transactions/export', exportRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/recurring', recurringRoutes);

// 7. Catch-all for undefined route paths
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on this server`
  });
});

// 8. Global Error Handling Middleware
app.use(errorHandler);

// 9. Export app for serverless deployment (Vercel)
module.exports = app;

// 10. Traditional Server Start (only when not in serverless environment)
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  const connectDB = require('./config/db');
  
  const PORT = process.env.PORT || 5000;
  
  // Establish Database Connection
  connectDB().then(() => {
    // Initialize cron jobs after DB is connected (traditional deployment only)
    require('./cron/currencyRefresh')();
    require('./cron/recurringTransactionJob')();
    
    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Expense Tracker Server active in [${process.env.NODE_ENV || 'development'}] mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections gracefully
    process.on('unhandledRejection', (err) => {
      console.error(`💥 Unhandled Promise Rejection: ${err.message}`);
      // Close server & exit process
      server.close(() => process.exit(1));
    });
  }).catch((err) => {
    console.error(`💥 Failed to start server: ${err.message}`);
    process.exit(1);
  });
}
