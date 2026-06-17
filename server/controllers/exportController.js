/**
 * @file exportController.js
 * @description Controller actions to filter transactions and stream PDF, Excel, or CSV files directly to the client.
 */

const Transaction = require('../models/Transaction');
const currencyService = require('../services/currencyService');
const { generateTransactionPDF } = require('../services/pdfExportService');
const { generateTransactionExcel } = require('../services/excelExportService');
const { Parser } = require('json2csv');

/**
 * Helper to convert transactions currency relative to target currency.
 */
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
 * Generates and streams transactions in CSV format.
 */
const streamCSVFallback = (res, convertedTransactions, filename) => {
  const fields = [
    { label: 'Date', value: (row) => new Date(row.date).toLocaleDateString('en-IN') },
    { label: 'Title', value: 'title' },
    { label: 'Category', value: 'category' },
    { label: 'Type', value: (row) => row.type === 'income' ? 'Income' : 'Expense' },
    { label: 'Amount', value: 'convertedAmount' },
    { label: 'Export Currency', value: 'displayCurrency' },
    { label: 'Original Amount', value: 'originalAmount' },
    { label: 'Original Currency', value: 'originalCurrency' },
    { label: 'Description', value: (row) => row.description || '' }
  ];

  try {
    const parser = new Parser({ fields });
    const csvContent = parser.parse(convertedTransactions);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    return res.status(200).send(csvContent);
  } catch (err) {
    console.error('❌ Fallback CSV generation failed:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate financial export files'
    });
  }
};

/**
 * Filter transactions query base generator
 */
const buildQuery = (userId, reqQuery) => {
  const query = { userId };
  const { startDate, endDate, category, type } = reqQuery;

  // 1. Date filter
  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      const parsedEndDate = new Date(endDate);
      parsedEndDate.setHours(23, 59, 59, 999);
      query.date.$lte = parsedEndDate;
    }
  }

  // 2. Category filter (supports multi-select comma separated)
  if (category) {
    const categoriesList = category.split(',').map(c => c.trim()).filter(Boolean);
    if (categoriesList.length > 0) {
      query.category = { $in: categoriesList };
    }
  }

  // 3. Type filter
  if (type && type !== 'all') {
    query.type = type;
  }

  return query;
};

/**
 * Export Transactions as PDF
 * @route GET /api/transactions/export/pdf
 */
exports.exportPDF = async (req, res, next) => {
  try {
    const query = buildQuery(req.user._id, req.query);
    const transactions = await Transaction.find(query).sort({ date: -1 });

    if (!transactions || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No data to export'
      });
    }

    const userPreferredCurrency = req.user.preferredCurrency || req.user.currency || 'USD';
    const targetCurrency = (req.query.currency || userPreferredCurrency).toUpperCase();

    // Fetch exchange rates
    let ratesData = null;
    try {
      ratesData = await currencyService.getRates(targetCurrency);
    } catch (err) {
      console.error('⚠️ Failed to load exchange rates for PDF conversion:', err.message);
    }

    // Convert transactions
    const convertedTransactions = transactions.map(t =>
      getTransactionWithConversion(t, ratesData, targetCurrency, userPreferredCurrency)
    );

    // Attempt PDF generation
    try {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="expense-report.pdf"');
      
      const doc = generateTransactionPDF(convertedTransactions, req.user, {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        currency: targetCurrency
      });

      doc.pipe(res);
    } catch (pdfErr) {
      console.error('❌ PDF generation failed. Falling back to CSV:', pdfErr.message);
      return streamCSVFallback(res, convertedTransactions, 'expense-report-fallback');
    }

  } catch (error) {
    next(error);
  }
};

/**
 * Export Transactions as Excel
 * @route GET /api/transactions/export/excel
 */
exports.exportExcel = async (req, res, next) => {
  try {
    const query = buildQuery(req.user._id, req.query);
    const transactions = await Transaction.find(query).sort({ date: -1 });

    if (!transactions || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No data to export'
      });
    }

    const userPreferredCurrency = req.user.preferredCurrency || req.user.currency || 'USD';
    const targetCurrency = (req.query.currency || userPreferredCurrency).toUpperCase();

    // Fetch exchange rates
    let ratesData = null;
    try {
      ratesData = await currencyService.getRates(targetCurrency);
    } catch (err) {
      console.error('⚠️ Failed to load exchange rates for Excel conversion:', err.message);
    }

    // Convert transactions
    const convertedTransactions = transactions.map(t =>
      getTransactionWithConversion(t, ratesData, targetCurrency, userPreferredCurrency)
    );

    // Attempt Excel generation
    try {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="expense-report.xlsx"');

      const workbook = generateTransactionExcel(convertedTransactions, req.user, {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        currency: targetCurrency
      });

      await workbook.xlsx.write(res);
      res.end();
    } catch (excelErr) {
      console.error('❌ Excel generation failed. Falling back to CSV:', excelErr.message);
      return streamCSVFallback(res, convertedTransactions, 'expense-report-fallback');
    }

  } catch (error) {
    next(error);
  }
};

/**
 * Export Transactions as CSV
 * @route GET /api/transactions/export/csv
 */
exports.exportCSV = async (req, res, next) => {
  try {
    const query = buildQuery(req.user._id, req.query);
    const transactions = await Transaction.find(query).sort({ date: -1 });

    if (!transactions || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No data to export'
      });
    }

    const userPreferredCurrency = req.user.preferredCurrency || req.user.currency || 'USD';
    const targetCurrency = (req.query.currency || userPreferredCurrency).toUpperCase();

    // Fetch exchange rates
    let ratesData = null;
    try {
      ratesData = await currencyService.getRates(targetCurrency);
    } catch (err) {
      console.error('⚠️ Failed to load exchange rates for CSV conversion:', err.message);
    }

    // Convert transactions
    const convertedTransactions = transactions.map(t =>
      getTransactionWithConversion(t, ratesData, targetCurrency, userPreferredCurrency)
    );

    return streamCSVFallback(res, convertedTransactions, 'expense-report');
  } catch (error) {
    next(error);
  }
};
