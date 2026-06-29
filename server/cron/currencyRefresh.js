/**
 * @file currencyRefresh.js
 * @description Schedules daily currency rates refresh at midnight UTC using node-cron, and triggers an immediate refresh on startup if cache is expired/missing.
 */

const cron = require('node-cron');
const currencyService = require('../services/currencyService');

/**
 * Initializes the currency cron schedules and runs immediate startup checks.
 * @function initCurrencyCron
 */
const initCurrencyCron = () => {
  // 1. Schedule daily refresh at midnight UTC: '0 0 * * *'
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Running daily scheduled currency rates refresh...');
    try {
      await currencyService.fetchAndCacheRates('USD');
      console.log('✅ Daily scheduled currency rates refresh succeeded.');
    } catch (err) {
      console.error('❌ Scheduled daily currency rates refresh failed:', err.message);
    }
  }, {
    scheduled: true,
    timezone: 'UTC',
  });

  // 2. Perform immediate startup check
  checkAndFetchOnStart();
};

/**
 * Checks ifcached rates exist and are still valid. If not, fetches them immediately.
 * @async
 * @function checkAndFetchOnStart
 */
const checkAndFetchOnStart = async () => {
  console.log('🔄 Verifying cached currency rates on server startup...');
  try {
    const rates = await currencyService.getLatestRatesFromDB('USD');
    
    // Check if rates don't exist or are older than 24 hours (expired)
    if (!rates || !rates.expiresAt || new Date() > new Date(rates.expiresAt)) {
      console.log('⚠️ Cached rates are missing or expired. Fetching fresh rates immediately...');
      await currencyService.fetchAndCacheRates('USD');
      console.log('✅ Currency rates cache initialized successfully on startup.');
    } else {
      console.log(`✅ Cached currency rates from ${rates.fetchedAt} are still valid. Next scheduled refresh at midnight UTC.`);
    }
  } catch (err) {
    // Non-fatal: log the error but NEVER crash the server on startup
    console.error('❌ Startup verification/refresh of currency rates failed (non-fatal):', err.message);
    console.warn('⚠️ Server will continue without pre-cached currency rates. Rates will be fetched on first request.');
  }
};

module.exports = initCurrencyCron;
