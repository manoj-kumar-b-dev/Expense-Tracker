/**
 * @file excelExportService.js
 * @description Service to create a multi-sheet, professional Excel workbook using exceljs.
 */

const ExcelJS = require('exceljs');

const excelCurrencyFormats = {
  USD: '"$"#,##0.00',
  EUR: '€#,##0.00',
  GBP: '£#,##0.00',
  INR: '₹#,##0.00',
  JPY: '¥#,##0',
  AUD: '"A$"#,##0.00',
  CAD: '"C$"#,##0.00'
};

/**
 * Generates structured Excel workbook with 3 sheets.
 * @param {Array<Object>} transactions - Pre-converted transactions.
 * @param {Object} user - User details.
 * @param {Object} filters - Applied filters.
 * @returns {ExcelJS.Workbook}
 */
const generateTransactionExcel = (transactions, user, filters) => {
  const currencyCode = (filters.currency || user.preferredCurrency || user.currency || 'USD').toUpperCase();
  const numFmt = excelCurrencyFormats[currencyCode] || '"$"#,##0.00';

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Expense Tracker';
  workbook.lastModifiedBy = 'Expense Tracker';
  workbook.created = new Date();

  // 1. Calculations
  let totalIncome = 0;
  let totalExpense = 0;
  const categoryMap = {};

  transactions.forEach(t => {
    const amt = t.convertedAmount !== undefined ? t.convertedAmount : t.amount;
    if (t.type === 'income') {
      totalIncome += amt;
    } else {
      totalExpense += amt;
    }

    if (!categoryMap[t.category]) {
      categoryMap[t.category] = { amount: 0, count: 0 };
    }
    categoryMap[t.category].amount += amt;
    categoryMap[t.category].count += 1;
  });

  const netBalance = totalIncome - totalExpense;

  // ----------------------------------------------------
  // SHEET 1: Transactions
  // ----------------------------------------------------
  const sheet1 = workbook.addWorksheet('Transactions');
  sheet1.views = [
    { state: 'frozen', xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomRight' }
  ];

  sheet1.columns = [
    { header: 'Transaction ID', key: 'id', width: 28 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Title', key: 'title', width: 25 },
    { header: 'Category', key: 'category', width: 18 },
    { header: 'Type', key: 'type', width: 12 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Original Currency', key: 'origCurrency', width: 18 },
    { header: 'Original Amount', key: 'origAmount', width: 18 },
    { header: 'Description', key: 'description', width: 30 }
  ];

  transactions.forEach(t => {
    const amt = t.convertedAmount !== undefined ? t.convertedAmount : t.amount;
    const origAmt = t.originalAmount !== undefined ? t.originalAmount : t.amount;
    const origCurr = t.originalCurrency || user.preferredCurrency || user.currency || 'USD';
    
    sheet1.addRow({
      id: String(t._id),
      date: new Date(t.date).toLocaleDateString('en-IN'),
      title: t.title,
      category: t.category,
      type: t.type === 'income' ? 'Income' : 'Expense',
      amount: amt,
      origCurrency: origCurr.toUpperCase(),
      origAmount: origAmt,
      description: t.description || ''
    });
  });

  // Enable Auto Filter
  sheet1.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 9 }
  };

  // Header Styling (Bold Blue)
  const headerRow1 = sheet1.getRow(1);
  headerRow1.height = 24;
  headerRow1.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' } // Bold Blue
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // Format cell numbers & alternating rows
  sheet1.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    
    // Amount format
    const amountCell = row.getCell('amount');
    amountCell.numFmt = numFmt;
    amountCell.font = { bold: true };
    
    const origAmountCell = row.getCell('origAmount');
    const origCurr = row.getCell('origCurrency').value;
    origAmountCell.numFmt = excelCurrencyFormats[origCurr] || numFmt;

    // Type styling
    const typeCell = row.getCell('type');
    if (typeCell.value === 'Income') {
      typeCell.font = { color: { argb: 'FF15803D' }, bold: true };
    } else {
      typeCell.font = { color: { argb: 'FFB91C1C' }, bold: true };
    }

    // Zebra striping
    if (rowNumber % 2 === 0) {
      row.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' }
        };
      });
    }

    // Border
    row.eachCell(cell => {
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });
  });

  // Auto column widths
  sheet1.columns.forEach(column => {
    let maxLen = 0;
    column.eachCell({ includeEmpty: true }, cell => {
      const len = cell.value ? String(cell.value).length : 0;
      if (len > maxLen) maxLen = len;
    });
    column.width = Math.max(maxLen + 4, 12);
  });


  // ----------------------------------------------------
  // SHEET 2: Summary
  // ----------------------------------------------------
  const sheet2 = workbook.addWorksheet('Summary');
  
  sheet2.addRow([]);
  sheet2.addRow(['FINANCIAL SUMMARY']);
  sheet2.getCell('A2').font = { size: 14, bold: true, color: { argb: 'FF1E3A8A' } };
  
  sheet2.addRow([]);
  sheet2.addRow(['Metric', 'Value']);
  const metricsHeader = sheet2.getRow(4);
  metricsHeader.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
    cell.alignment = { horizontal: 'center' };
  });

  sheet2.addRow(['Total Income', totalIncome]);
  sheet2.addRow(['Total Expenses', totalExpense]);
  sheet2.addRow(['Net Balance', netBalance]);

  // Format cells
  sheet2.getCell('B5').numFmt = numFmt;
  sheet2.getCell('B5').font = { bold: true, color: { argb: 'FF15803D' } };
  sheet2.getCell('B6').numFmt = numFmt;
  sheet2.getCell('B6').font = { bold: true, color: { argb: 'FFB91C1C' } };
  sheet2.getCell('B7').numFmt = numFmt;
  sheet2.getCell('B7').font = { bold: true, color: { argb: netBalance >= 0 ? 'FF1E40AF' : 'FF9A3412' } };

  // Border for Summary Table
  for (let r = 4; r <= 7; r++) {
    sheet2.getRow(r).eachCell(cell => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
      };
    });
  }

  // Top 5 categories
  sheet2.addRow([]);
  sheet2.addRow([]);
  sheet2.addRow(['TOP 5 CATEGORIES (By Expense Volume)']);
  sheet2.getCell('A10').font = { size: 12, bold: true, color: { argb: 'FF1E3A8A' } };
  
  sheet2.addRow([]);
  sheet2.addRow(['Category', 'Total Amount']);
  const catHeader = sheet2.getRow(12);
  catHeader.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
    cell.alignment = { horizontal: 'center' };
  });

  const sortedCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1].amount - a[1].amount)
    .slice(0, 5);

  sortedCategories.forEach(([catName, data]) => {
    sheet2.addRow([catName, data.amount]);
  });

  // Style categories
  let categoryRowIndex = 13;
  sortedCategories.forEach(() => {
    const row = sheet2.getRow(categoryRowIndex);
    row.getCell('B').numFmt = numFmt;
    row.getCell('B').font = { bold: true };
    row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });
    categoryRowIndex++;
  });

  sheet2.getColumn('A').width = 25;
  sheet2.getColumn('B').width = 20;


  // ----------------------------------------------------
  // SHEET 3: Category Breakdown
  // ----------------------------------------------------
  const sheet3 = workbook.addWorksheet('Category Breakdown');
  
  sheet3.columns = [
    { header: 'Category Name', key: 'category', width: 22 },
    { header: 'Total Amount', key: 'amount', width: 18 },
    { header: 'Transaction Count', key: 'count', width: 22 },
    { header: 'Percentage of Total', key: 'percentage', width: 22 }
  ];

  const headerRow3 = sheet3.getRow(1);
  headerRow3.height = 22;
  headerRow3.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  const totalVolume = totalIncome + totalExpense;

  Object.entries(categoryMap).forEach(([catName, data]) => {
    const share = totalVolume > 0 ? (data.amount / totalVolume) : 0;
    sheet3.addRow({
      category: catName,
      amount: data.amount,
      count: data.count,
      percentage: share
    });
  });

  sheet3.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    
    row.getCell('amount').numFmt = numFmt;
    row.getCell('amount').font = { bold: true };
    
    const pctCell = row.getCell('percentage');
    pctCell.numFmt = '0.0%';
    
    row.getCell('count').alignment = { horizontal: 'center' };

    // Zebra striping
    if (rowNumber % 2 === 0) {
      row.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' }
        };
      });
    }

    row.eachCell(cell => {
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });
  });

  return workbook;
};

module.exports = {
  generateTransactionExcel
};
