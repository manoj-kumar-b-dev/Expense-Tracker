/**
 * @file db.js
 * @description Mongoose database connection configuration with automated reconnection and retry policies.
 * Enhanced with serverless connection caching for Vercel deployment.
 */

const mongoose = require('mongoose');

/**
 * Global connection cache for serverless environments.
 * Prevents creating new connections on every function invocation.
 */
let cachedConnection = null;

/**
 * Establishes a connection to the MongoDB database with retry logic on failure.
 * Implements connection caching for serverless environments (Vercel).
 * @async
 * @function connectDB
 * @returns {Promise<mongoose.Connection>} Resolves with the MongoDB connection.
 */
const connectDB = async () => {
  // Return cached connection if it exists and is ready
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('♻️  Using cached MongoDB connection');
    return cachedConnection;
  }

  const connUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';
  let retries = 5;

  while (retries > 0) {
    try {
      const conn = await mongoose.connect(connUri, {
        // Optimize for serverless
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      
      console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
      
      // Cache the connection for reuse in serverless environment
      cachedConnection = conn.connection;
      
      return cachedConnection;
    } catch (error) {
      retries -= 1;
      console.error(`❌ MongoDB connection failed: ${error.message}`);
      
      if (retries === 0) {
        console.error('💥 Max database connection retries reached.');
        
        // In serverless, throw error instead of process.exit
        if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
          throw new Error(`Failed to connect to MongoDB: ${error.message}`);
        } else {
          process.exit(1);
        }
      }
      
      console.log(`🔄 Retrying database connection... (${retries} retries left)`);
      // Wait for 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

module.exports = connectDB;
