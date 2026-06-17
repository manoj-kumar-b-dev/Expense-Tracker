/**
 * @file analyticsController.js
 * @description Controllers to aggregate and compute charts-friendly data for dashboard visualizations.
 */

const Transaction = require('../models/Transaction');
const currencyService = require('../services/currencyService');

// Helper to accumulate converted and original amounts in a trend/monthly bucket
const accumulateBucket = (bucket, type, trans, ratesData, targetCurrency, userPreferredCurrency) => {
  const origAmount = trans.originalAmount !== undefined && trans.originalAmount !== null ? trans.originalAmount : trans.amount;
  const origCurrency = (trans.originalCurrency || userPreferredCurrency || 'USD').toUpperCase();
  
  // Convert
  let convertedAmount = origAmount;
  if (ratesData && ratesData.rates) {
    const fromRate = ratesData.rates[origCurrency];
    if (fromRate) {
      convertedAmount = Number((origAmount / fromRate).toFixed(2));
    }
  }

  // Add converted
  bucket[type] = Number((bucket[type] + convertedAmount).toFixed(2));

  // Initialize original trackers if they don't exist
  const origKey = `${type}Original`;
  const currKey = `${type}OriginalCurrency`;
  const listKey = `${type}OriginalList`; // to track unique currencies

  if (bucket[origKey] === undefined) {
    bucket[origKey] = 0;
    bucket[listKey] = new Set();
  }

  bucket[origKey] = Number((bucket[origKey] + origAmount).toFixed(2));
  bucket[listKey].add(origCurrency);

  // Set original currency name
  if (bucket[listKey].size === 1) {
    bucket[currKey] = origCurrency;
  } else {
    bucket[currKey] = 'Mixed';
  }
};

/**
 * Aggregates monthly income and expense totals for the past 6 months.
 * @route GET /api/analytics/monthly
 * @async
 * @function getMonthlyAnalytics
 */
exports.getMonthlyAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userPreferredCurrency = req.user.preferredCurrency || req.user.currency || 'USD';
    const displayCurrency = req.query.displayCurrency || userPreferredCurrency;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Set to start of month
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const transactions = await Transaction.find({
      userId,
      date: { $gte: sixMonthsAgo },
    });

    // Fetch exchange rates relative to display currency
    let ratesData = null;
    try {
      ratesData = await currencyService.getRates(displayCurrency);
    } catch (err) {
      console.error('⚠️ Failed to load exchange rates for monthly analytics:', err.message);
    }

    // Format results chronologically for recharts
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedData = [];

    // Initialize past 6 months default arrays
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      formattedData.push({
        monthName: `${months[m - 1]} ${y}`,
        monthNum: m,
        year: y,
        income: 0,
        expense: 0,
      });
    }

    transactions.forEach((trans) => {
      const transDate = new Date(trans.date);
      const m = transDate.getMonth() + 1;
      const y = transDate.getFullYear();

      const match = formattedData.find(
        (fd) => fd.monthNum === m && fd.year === y
      );
      if (match) {
        accumulateBucket(match, trans.type, trans, ratesData, displayCurrency, userPreferredCurrency);
      }
    });

    // Clean up temporary Sets used for unique currencies tracking before sending
    formattedData.forEach((fd) => {
      delete fd.incomeOriginalList;
      delete fd.expenseOriginalList;
    });

    return res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Aggregates expenses by category for the current month.
 * @route GET /api/analytics/category
 * @async
 * @function getCategoryAnalytics
 */
exports.getCategoryAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userPreferredCurrency = req.user.preferredCurrency || req.user.currency || 'USD';
    const displayCurrency = req.query.displayCurrency || userPreferredCurrency;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const transactions = await Transaction.find({
      userId,
      type: 'expense',
      date: { $gte: startOfMonth },
    });

    // Fetch exchange rates relative to display currency
    let ratesData = null;
    try {
      ratesData = await currencyService.getRates(displayCurrency);
    } catch (err) {
      console.error('⚠️ Failed to load exchange rates for category analytics:', err.message);
    }

    const categoryMap = {};
    transactions.forEach((trans) => {
      const origAmount = trans.originalAmount !== undefined && trans.originalAmount !== null ? trans.originalAmount : trans.amount;
      const origCurrency = (trans.originalCurrency || userPreferredCurrency || 'USD').toUpperCase();
      
      // Convert
      let convertedAmount = origAmount;
      if (ratesData && ratesData.rates) {
        const fromRate = ratesData.rates[origCurrency];
        if (fromRate) {
          convertedAmount = Number((origAmount / fromRate).toFixed(2));
        }
      }

      const cat = trans.category;
      if (!categoryMap[cat]) {
        categoryMap[cat] = {
          name: cat,
          value: 0,
          originalValue: 0,
          currencies: new Set(),
        };
      }

      categoryMap[cat].value = Number((categoryMap[cat].value + convertedAmount).toFixed(2));
      categoryMap[cat].originalValue = Number((categoryMap[cat].originalValue + origAmount).toFixed(2));
      categoryMap[cat].currencies.add(origCurrency);
    });

    const categoryStats = Object.keys(categoryMap).map(catKey => {
      const cat = categoryMap[catKey];
      return {
        name: cat.name,
        value: cat.value,
        originalValue: cat.originalValue,
        originalCurrency: cat.currencies.size === 1 ? [...cat.currencies][0] : 'Mixed',
      };
    }).sort((a, b) => b.value - a.value);

    return res.status(200).json({
      success: true,
      data: categoryStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Aggregates daily transaction trends for the past 30 days.
 * @route GET /api/analytics/trend
 * @async
 * @function getTrendAnalytics
 */
exports.getTrendAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userPreferredCurrency = req.user.preferredCurrency || req.user.currency || 'USD';
    const displayCurrency = req.query.displayCurrency || userPreferredCurrency;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const transactions = await Transaction.find({
      userId,
      date: { $gte: thirtyDaysAgo },
    });

    // Fetch exchange rates relative to display currency
    let ratesData = null;
    try {
      ratesData = await currencyService.getRates(displayCurrency);
    } catch (err) {
      console.error('⚠️ Failed to load exchange rates for trend analytics:', err.message);
    }

    // Build chronological days map
    const trendData = [];
    const tempMap = {};

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      tempMap[dateStr] = {
        date: displayDate,
        income: 0,
        expense: 0,
      };
      trendData.push(dateStr);
    }

    transactions.forEach((trans) => {
      const transDate = new Date(trans.date);
      const dateKey = transDate.toISOString().split('T')[0];
      if (tempMap[dateKey]) {
        accumulateBucket(tempMap[dateKey], trans.type, trans, ratesData, displayCurrency, userPreferredCurrency);
      }
    });

    const finalTrend = trendData.map((dStr) => {
      const item = tempMap[dStr];
      delete item.incomeOriginalList;
      delete item.expenseOriginalList;
      return item;
    });

    return res.status(200).json({
      success: true,
      data: finalTrend,
    });
  } catch (error) {
    next(error);
  }
};
