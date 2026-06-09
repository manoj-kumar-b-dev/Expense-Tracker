/**
 * @file budgetController.js
 * @description Controllers to manage budget targets and live category utilization metrics.
 */

const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

/**
 * Get all budgets for the logged-in user.
 * @route GET /api/budgets
 * @async
 * @function getBudgets
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
exports.getBudgets = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const filter = { userId: req.user._id };

    if (month) filter.month = parseInt(month, 10);
    if (year) filter.year = parseInt(year, 10);

    const budgets = await Budget.find(filter).sort({ year: -1, month: -1, category: 1 });

    return res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Define a new budget target.
 * @route POST /api/budgets
 * @async
 * @function createBudget
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
exports.createBudget = async (req, res, next) => {
  try {
    const { category, monthlyLimit, month, year } = req.body;

    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);

    // Check if duplicate exists
    const duplicate = await Budget.findOne({
      userId: req.user._id,
      category,
      month: parsedMonth,
      year: parsedYear,
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: `A budget already exists for category "${category}" in ${parsedMonth}/${parsedYear}. Edit the existing budget instead.`,
      });
    }

    const budget = await Budget.create({
      userId: req.user._id,
      category,
      monthlyLimit,
      month: parsedMonth,
      year: parsedYear,
    });

    return res.status(201).json({
      success: true,
      message: 'Budget category created successfully',
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing budget threshold.
 * @route PUT /api/budgets/:id
 * @async
 * @function updateBudget
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
exports.updateBudget = async (req, res, next) => {
  try {
    const { monthlyLimit, month, year } = req.body;
    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget plan not found',
      });
    }

    // Verify ownership
    if (budget.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this budget configuration',
      });
    }

    const updates = {};
    if (monthlyLimit !== undefined) updates.monthlyLimit = monthlyLimit;
    if (month !== undefined) updates.month = parseInt(month, 10);
    if (year !== undefined) updates.year = parseInt(year, 10);

    budget = await Budget.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Budget plan updated successfully',
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a budget rule.
 * @route DELETE /api/budgets/:id
 * @async
 * @function deleteBudget
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget rule not found',
      });
    }

    if (budget.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this budget configuration',
      });
    }

    await budget.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Budget rule deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calculates current month spent status vs monthly limit targets.
 * @route GET /api/budgets/status
 * @async
 * @function getBudgetStatus
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
exports.getBudgetStatus = async (req, res, next) => {
  try {
    const now = new Date();
    const queryMonth = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const queryYear = parseInt(req.query.year, 10) || now.getFullYear();

    // Find all budget limits for this month/year
    const budgets = await Budget.find({
      userId: req.user._id,
      month: queryMonth,
      year: queryYear,
    });

    // Create a start and end date for transactions in this specific month
    const startOfMonth = new Date(queryYear, queryMonth - 1, 1);
    const endOfMonth = new Date(queryYear, queryMonth, 0, 23, 59, 59, 999);

    // Aggregate expense transactions for this month grouped by category
    const expenses = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    // Create a dictionary of category -> spent
    const spentMap = expenses.reduce((acc, curr) => {
      acc[curr._id] = curr.totalSpent;
      return acc;
    }, {});

    // Map budgets to include utilization statuses
    const budgetStatus = budgets.map((b) => {
      const spent = spentMap[b.category] || 0;
      const limit = b.monthlyLimit;
      const utilizationRate = limit > 0 ? (spent / limit) * 100 : 0;

      let status = 'normal';
      if (utilizationRate >= 90) {
        status = 'exceeded'; // Danger!
      } else if (utilizationRate >= 75) {
        status = 'warning'; // Warning!
      }

      return {
        _id: b._id,
        category: b.category,
        monthlyLimit: limit,
        spent: Math.round(spent * 100) / 100,
        utilizationRate: Math.round(utilizationRate * 100) / 100,
        status,
        month: b.month,
        year: b.year,
      };
    });

    // Handle categories that have expenses but no budgets set yet
    const budgetedCategories = new Set(budgets.map((b) => b.category));
    const extraCategories = [];

    Object.keys(spentMap).forEach((category) => {
      if (!budgetedCategories.has(category)) {
        extraCategories.push({
          _id: null,
          category,
          monthlyLimit: 0,
          spent: Math.round(spentMap[category] * 100) / 100,
          utilizationRate: 0,
          status: 'unbudgeted',
          month: queryMonth,
          year: queryYear,
        });
      }
    });

    return res.status(200).json({
      success: true,
      data: [...budgetStatus, ...extraCategories],
    });
  } catch (error) {
    next(error);
  }
};
