/**
 * @file currencyController.js
 * @description Controller actions for fetching cached exchange rates and manually forcing cache refresh.
 */

const currencyService = require('../services/currencyService');

/**
 * Get cached rates relative to USD (default base).
 * @route GET /api/currency/rates
 * @async
 * @function getRatesUSD
 */
exports.getRatesUSD = async (req, res, next) => {
  try {
    const ratesData = await currencyService.getRates('USD');
    return res.status(200).json({
      success: true,
      data: ratesData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get cached rates relative to a specific base currency.
 * @route GET /api/currency/rates/:baseCurrency
 * @async
 * @function getRatesByBase
 */
exports.getRatesByBase = async (req, res, next) => {
  try {
    const { baseCurrency } = req.params;
    const ratesData = await currencyService.getRates(baseCurrency);
    return res.status(200).json({
      success: true,
      data: ratesData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manually trigger exchange rate refresh (admin only).
 * @route POST /api/currency/refresh
 * @async
 * @function refreshRates
 */
exports.refreshRates = async (req, res, next) => {
  try {
    // Check user admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin permissions required',
      });
    }

    const ratesData = await currencyService.fetchAndCacheRates('USD');
    return res.status(200).json({
      success: true,
      message: 'Currency exchange rates successfully refreshed.',
      data: ratesData,
    });
  } catch (error) {
    next(error);
  }
};
