/**
 * @file csvExporter.js
 * @description Utility to format and stream transaction data to CSV format.
 */

const { Parser } = require('json2csv');

/**
 * Converts transactions database records into CSV string format.
 * @function exportTransactionsToCSV
 * @param {Array<Object>} transactions - Array of transaction documents.
 * @returns {string} CSV formatted data string.
 */
const exportTransactionsToCSV = (transactions) => {
  const fields = [
    { label: 'Transaction ID', value: '_id' },
    { label: 'Type', value: 'type' },
    { label: 'Amount', value: 'amount' },
    { label: 'Category', value: 'category' },
    { label: 'Title', value: 'title' },
    { label: 'Description', value: 'description' },
    { label: 'Date', value: (row) => new Date(row.date).toLocaleDateString() },
    { label: 'Created At', value: (row) => new Date(row.createdAt).toLocaleDateString() }
  ];

  try {
    const json2csvParser = new Parser({ fields });
    return json2csvParser.parse(transactions);
  } catch (error) {
    console.error(`❌ CSV parsing failed: ${error.message}`);
    throw new Error('Failed to generate CSV export file');
  }
};

module.exports = { exportTransactionsToCSV };
