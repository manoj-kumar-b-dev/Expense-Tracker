/**
 * @file transactionController.js
 * @description Controller actions for CRUD transactions, pagination, searching, and CSV downloads.
 */

const Transaction = require('../models/Transaction');
const { exportTransactionsToCSV } = require('../utils/csvExporter');
const currencyService = require('../services/currencyService');

const getTransactionWithConversion = (trans, ratesData, displayCurrency, userPreferredCurrency) => {
  const origAmount = trans.originalAmount !== undefined && trans.originalAmount !== null ? trans.originalAmount : trans.amount;
  const origCurrency = (trans.originalCurrency || userPreferredCurrency || 'USD').toUpperCase();
  
  let convertedAmount = origAmount;
  if (ratesData && ratesData.rates) {
    const fromRate = ratesData.rates[origCurrency];
    if (fromRate) {
      convertedAmount = Number((origAmount / fromRate).toFixed(2));
    }
  }

  const transObj = trans.toObject ? trans.toObject() : trans;
  return {
    ...transObj,
    originalAmount: origAmount,
    originalCurrency: origCurrency,
    convertedAmount,
    displayCurrency
  };
};

/**
 * Get all transactions for the logged-in user with filtering, sorting, searching, and pagination.
 * @route GET /api/transactions
 * @async
 * @function getTransactions
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
exports.getTransactions = async (req, res, next) => {
  try {
    const query = { userId: req.user._id };
    const { search, type, category, startDate, endDate, sort, page = 1, limit = 10, displayCurrency } = req.query;

    // 1. Text Search matching title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 2. Type Filter (income / expense)
    if (type) {
      query.type = type;
    }

    // 3. Category Filter
    if (category) {
      query.category = category;
    }

    // 4. Date Range Filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of that day (23:59:59.999)
        const parsedEndDate = new Date(endDate);
        parsedEndDate.setHours(23, 59, 59, 999);
        query.date.$lte = parsedEndDate;
      }
    }

    // 5. Pagination Setup
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // 6. Sorting Setup
    let sortOption = { date: -1 }; // default sorting
    if (sort) {
      const parts = sort.split(':');
      sortOption = { [parts[0]]: parts[1] === 'desc' ? -1 : 1 };
    }

    // Execute queries in parallel
    const [transactions, total] = await Promise.all([
      Transaction.find(query).sort(sortOption).skip(skip).limit(limitNum),
      Transaction.countDocuments(query)
    ]);

    const userPreferredCurrency = req.user.preferredCurrency || req.user.currency || 'USD';
    const cleanDisplayCurrency = (displayCurrency || userPreferredCurrency).toUpperCase();

    // Fetch currency rates relative to display currency
    let ratesData = null;
    try {
      ratesData = await currencyService.getRates(cleanDisplayCurrency);
    } catch (err) {
      console.error('⚠️ Failed to load exchange rates for transactions retrieval:', err.message);
    }

    // Convert paginated transaction list
    const convertedTransactions = transactions.map(t =>
      getTransactionWithConversion(t, ratesData, cleanDisplayCurrency, userPreferredCurrency)
    );

    // Calculate totals for income/expense matching this query
    const totalTransactionsQuery = await Transaction.find({ userId: req.user._id });
    const balanceStats = totalTransactionsQuery.reduce(
      (acc, curr) => {
        const converted = getTransactionWithConversion(curr, ratesData, cleanDisplayCurrency, userPreferredCurrency);
        if (curr.type === 'income') {
          acc.income += converted.convertedAmount;
        } else {
          acc.expense += converted.convertedAmount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
    balanceStats.income = Number(balanceStats.income.toFixed(2));
    balanceStats.expense = Number(balanceStats.expense.toFixed(2));
    balanceStats.balance = Number((balanceStats.income - balanceStats.expense).toFixed(2));

    return res.status(200).json({
      success: true,
      count: convertedTransactions.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
      stats: balanceStats,
      data: convertedTransactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new transaction record.
 * @route POST /api/transactions
 * @async
 * @function createTransaction
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
exports.createTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, title, description, date, originalAmount, originalCurrency } = req.body;

    const userPreferredCurrency = req.user.preferredCurrency || req.user.currency || 'USD';
    const finalOriginalAmount = originalAmount !== undefined ? originalAmount : amount;
    const finalOriginalCurrency = (originalCurrency || userPreferredCurrency).toUpperCase();

    const transaction = await Transaction.create({
      userId: req.user._id,
      type,
      amount: finalOriginalAmount, // Keep existing amount field as-is for backward compatibility
      originalAmount: finalOriginalAmount,
      originalCurrency: finalOriginalCurrency,
      category,
      title,
      description: description || '',
      date: date ? new Date(date) : Date.now(),
    });

    return res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing transaction record.
 * @route PUT /api/transactions/:id
 * @async
 * @function updateTransaction
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
exports.updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    // Verify ownership
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this transaction record',
      });
    }

    // Update keys
    const updateFields = {};
    const allowedKeys = ['type', 'amount', 'category', 'title', 'description', 'date', 'originalAmount', 'originalCurrency'];
    allowedKeys.forEach((key) => {
      if (req.body[key] !== undefined) {
        updateFields[key] = req.body[key];
      }
    });

    // Sync amount and originalAmount if only one is updated
    if (req.body.amount !== undefined && req.body.originalAmount === undefined) {
      updateFields.originalAmount = req.body.amount;
    }
    if (req.body.originalAmount !== undefined && req.body.amount === undefined) {
      updateFields.amount = req.body.originalAmount;
    }

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a transaction record.
 * @route DELETE /api/transactions/:id
 * @async
 * @function deleteTransaction
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    // Verify ownership
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this transaction record',
      });
    }

    await transaction.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Transaction record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Streams filtered transactions data as an downloadable CSV file.
 * @route GET /api/transactions/export/csv
 * @async
 * @function exportTransactions
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
exports.exportTransactions = async (req, res, next) => {
  try {
    const query = { userId: req.user._id };
    const { search, type, category, startDate, endDate, sort } = req.query;

    // Apply same filters as query without paginated skipping
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const parsedEndDate = new Date(endDate);
        parsedEndDate.setHours(23, 59, 59, 999);
        query.date.$lte = parsedEndDate;
      }
    }

    let sortOption = { date: -1 };
    if (sort) {
      const parts = sort.split(':');
      sortOption = { [parts[0]]: parts[1] === 'desc' ? -1 : 1 };
    }

    const transactions = await Transaction.find(query).sort(sortOption);

    // Parse records using CSV parser
    const csvContent = exportTransactionsToCSV(transactions);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions_export.csv');
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
