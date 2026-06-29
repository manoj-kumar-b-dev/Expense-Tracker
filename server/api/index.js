/**
 * @file api/index.js
 * @description Vercel serverless entry point for the Express application.
 * This file is the main handler for all API requests on Vercel.
 * It initializes the database connection and exports the Express app.
 */

const connectDB = require('../config/db');
const app = require('../server');

// Connect to database before handling requests
// The cached connection will be reused across invocations
connectDB().catch(err => {
  console.error('Failed to connect to database:', err);
});

// Export the Express app as a serverless function
module.exports = app;
