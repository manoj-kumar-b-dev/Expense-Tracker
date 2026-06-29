/**
 * @file api/cron/currency-refresh.js
 * @description Vercel Cron Job endpoint for refreshing currency rates.
 * This endpoint is called by Vercel Cron on a schedule defined in vercel.json.
 * 
 * Schedule: Daily at midnight UTC (0 0 * * *)
 * 
 * This replaces the node-cron implementation from cron/currencyRefresh.js
 * which cannot run in serverless environments.
 */

const connectDB = require('../../config/db');
const currencyService = require('../../services/currencyService');

/**
 * Serverless function handler for currency rate refresh cron job.
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 */
module.exports = async (req, res) => {
  // Security: Verify the request is from Vercel Cron
  // Vercel adds a special header to cron requests
  const authHeader = req.headers.authorization;
  
  // Check if CRON_SECRET is set and validate it
  if (process.env.CRON_SECRET) {
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    if (authHeader !== expectedAuth) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid cron secret'
      });
    }
  }

  console.log('⏰ [Vercel Cron] Currency refresh job triggered at', new Date().toISOString());

  try {
    // Connect to database (will use cached connection if available)
    await connectDB();

    // Fetch and cache currency rates
    await currencyService.fetchAndCacheRates('USD');

    console.log('✅ [Vercel Cron] Currency rates refresh completed successfully');

    return res.status(200).json({
      success: true,
      message: 'Currency rates refreshed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [Vercel Cron] Currency refresh failed:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Currency refresh failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
