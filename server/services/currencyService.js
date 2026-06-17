/**
 * @file currencyService.js
 * @description Service to fetch exchange rates from external API and manage caching in MongoDB.
 * Performs mathematical rate adjustments for target bases on-the-fly to minimize external API requests.
 */

const axios = require('axios');
const CurrencyRate = require('../models/CurrencyRate');

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'];

/**
 * Fetch latest rates from external API and cache them in MongoDB relative to a base currency.
 * @async
 * @function fetchAndCacheRates
 * @param {string} [baseCurrency='USD'] - Base currency to fetch rates for.
 * @returns {Promise<Object>} Mongoose document of updated currency rates.
 */
const fetchAndCacheRates = async (baseCurrency = 'USD') => {
  const cleanBase = baseCurrency.toUpperCase();
  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    const apiUrl = process.env.EXCHANGE_RATE_API_URL;
    let url;

    // Use ExchangeRate-API if credentials are provided, otherwise fall back to open.er-api.com
    if (apiKey && apiKey !== 'your_api_key_here' && apiKey.trim() !== '') {
      const baseUrl = apiUrl || 'https://v6.exchangerate-api.com/v6';
      url = `${baseUrl}/${apiKey}/latest/${cleanBase}`;
    } else {
      url = `https://open.er-api.com/v6/latest/${cleanBase}`;
    }

    console.log(`🌐 Fetching exchange rates from API: ${url}`);
    const response = await axios.get(url);

    if (response.data && (response.data.result === 'success' || response.data.base_code)) {
      const allRates = response.data.rates || response.data.conversion_rates;
      if (!allRates) {
        throw new Error('Exchange rate data missing from API response');
      }

      // Filter rates to contain only supported currencies
      const filteredRates = {};
      SUPPORTED_CURRENCIES.forEach(curr => {
        if (allRates[curr] !== undefined) {
          filteredRates[curr] = allRates[curr];
        }
      });

      // Ensure the base currency itself is exactly 1.0
      filteredRates[cleanBase] = 1.0;

      const fetchedAt = new Date();
      const expiresAt = new Date(fetchedAt.getTime() + 24 * 60 * 60 * 1000); // Expires in 24 hours

      // Upsert into MongoDB cache
      const updatedRates = await CurrencyRate.findOneAndUpdate(
        { base: cleanBase },
        {
          base: cleanBase,
          rates: filteredRates,
          fetchedAt,
          expiresAt,
        },
        { upsert: true, new: true }
      );

      return updatedRates;
    } else {
      throw new Error(response.data?.['error-type'] || 'Invalid response schema');
    }
  } catch (error) {
    console.error(`❌ Error fetching/caching rates for ${cleanBase}:`, error.message);
    
    // Fail-soft: Fall back to existing cached rates in DB if available
    const existing = await CurrencyRate.findOne({ base: cleanBase });
    if (existing) {
      console.warn(`⚠️ Using last cached rates from ${existing.fetchedAt} as API fallback.`);
      return existing;
    }
    throw new Error(`Exchange rate service unavailable and no cached rates exist: ${error.message}`);
  }
};

/**
 * Retrieve cached rates relative to USD from DB.
 * @async
 * @function getLatestRatesFromDB
 * @param {string} [baseCurrency='USD']
 * @returns {Promise<Object|null>}
 */
const getLatestRatesFromDB = async (baseCurrency = 'USD') => {
  return await CurrencyRate.findOne({ base: baseCurrency.toUpperCase() });
};

/**
 * Get rates relative to a target base currency.
 * Automatically handles on-demand refresh if cache is expired, falls back to old cache on API failure.
 * @async
 * @function getRates
 * @param {string} [targetBase='USD'] - Currency code rates should be relative to.
 * @returns {Promise<Object>} Formatted rates object containing base, rates map, and timestamps.
 */
const getRates = async (targetBase = 'USD') => {
  const cleanTargetBase = targetBase.toUpperCase();
  
  // Look up default base rates (USD) in DB
  let usdRatesDoc = await getLatestRatesFromDB('USD');

  // If missing or expired, attempt to refresh
  if (!usdRatesDoc || !usdRatesDoc.expiresAt || new Date() > new Date(usdRatesDoc.expiresAt)) {
    try {
      usdRatesDoc = await fetchAndCacheRates('USD');
    } catch (err) {
      console.error('⚠️ Failed to refresh rates on demand. Defaulting to cached data:', err.message);
      if (!usdRatesDoc) {
        throw new Error('Currency rates are not initialized and API is unavailable.');
      }
    }
  }

  // If USD is requested, return rates directly
  if (cleanTargetBase === 'USD') {
    return {
      base: 'USD',
      rates: Object.fromEntries(usdRatesDoc.rates),
      fetchedAt: usdRatesDoc.fetchedAt,
      expiresAt: usdRatesDoc.expiresAt,
    };
  }

  // Mathematically convert rates to targetBase relative (using cached USD base rates)
  // rate_target_to_curr = rate_USD_to_curr / rate_USD_to_target
  const usdRates = usdRatesDoc.rates;
  const targetRateInUSD = usdRates.get(cleanTargetBase);

  if (!targetRateInUSD) {
    throw new Error(`Unsupported base currency: ${cleanTargetBase}`);
  }

  const convertedRates = {};
  SUPPORTED_CURRENCIES.forEach(curr => {
    const rateInUSD = usdRates.get(curr);
    if (rateInUSD !== undefined) {
      convertedRates[curr] = Number((rateInUSD / targetRateInUSD).toFixed(6));
    }
  });

  return {
    base: cleanTargetBase,
    rates: convertedRates,
    fetchedAt: usdRatesDoc.fetchedAt,
    expiresAt: usdRatesDoc.expiresAt,
  };
};

/**
 * Convert an amount from one currency code to another.
 * @async
 * @function convert
 * @param {number} amount - Value to convert.
 * @param {string} fromCurrency - Starting currency code (e.g. INR).
 * @param {string} toCurrency - Destination currency code (e.g. USD).
 * @returns {Promise<number>} Converted value.
 */
const convert = async (amount, fromCurrency, toCurrency) => {
  if (amount === undefined || amount === null) return 0;
  const cleanFrom = fromCurrency.toUpperCase();
  const cleanTo = toCurrency.toUpperCase();
  if (cleanFrom === cleanTo) return amount;
  
  const ratesData = await getRates(cleanFrom);
  const conversionRate = ratesData.rates[cleanTo];
  if (!conversionRate) {
    throw new Error(`Conversion rate from ${cleanFrom} to ${cleanTo} not found.`);
  }

  return amount * conversionRate;
};

module.exports = {
  fetchAndCacheRates,
  getRates,
  getLatestRatesFromDB,
  convert,
  SUPPORTED_CURRENCIES,
};
