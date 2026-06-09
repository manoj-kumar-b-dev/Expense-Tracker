/**
 * @file analyticsController.js
 * @description Controllers to aggregate and compute charts-friendly data for dashboard visualizations.
 */

const Transaction = require('../models/Transaction');

/**
 * Aggregates monthly income and expense totals for the past 6 months.
 * @route GET /api/analytics/monthly
 * @async
 * @function getMonthlyAnalytics
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
exports.getMonthlyAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Set to start of month
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyStats = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

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

    monthlyStats.forEach((stat) => {
      const match = formattedData.find(
        (fd) => fd.monthNum === stat._id.month && fd.year === stat._id.year
      );
      if (match) {
        match[stat._id.type] = Math.round(stat.totalAmount * 100) / 100;
      }
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
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
exports.getCategoryAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const categoryStats = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          date: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          value: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: { $round: ['$value', 2] },
        },
      },
      {
        $sort: { value: -1 },
      },
    ]);

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
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
exports.getTrendAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const trendStats = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            dateStr: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.dateStr': 1 },
      },
    ]);

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

    trendStats.forEach((stat) => {
      const dateKey = stat._id.dateStr;
      if (tempMap[dateKey]) {
        tempMap[dateKey][stat._id.type] = Math.round(stat.total * 100) / 100;
      }
    });

    const finalTrend = trendData.map((dStr) => tempMap[dStr]);

    return res.status(200).json({
      success: true,
      data: finalTrend,
    });
  } catch (error) {
    next(error);
  }
};
