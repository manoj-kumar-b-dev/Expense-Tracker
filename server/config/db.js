/**
 * @file db.js
 * @description Mongoose database connection configuration with automated reconnection and retry policies.
 */

const mongoose = require('mongoose');

/**
 * Establishes a connection to the MongoDB database with retry logic on failure.
 * @async
 * @function connectDB
 * @returns {Promise<void>} Resolves when connection is successfully established.
 */
const connectDB = async () => {
  const connUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';
  let retries = 5;

  while (retries > 0) {
    try {
      const conn = await mongoose.connect(connUri);
      console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
      break;
    } catch (error) {
      retries -= 1;
      console.error(`❌ MongoDB connection failed: ${error.message}`);
      if (retries === 0) {
        console.error('💥 Max database connection retries reached. Exiting...');
        process.exit(1);
      }
      console.log(`🔄 Retrying database connection... (${retries} retries left)`);
      // Wait for 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

module.exports = connectDB;
