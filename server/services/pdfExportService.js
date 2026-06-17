/**
 * @file pdfExportService.js
 * @description Service to construct professional print-ready PDF reports with summaries, transaction tables, and category breakdown.
 */

const PDFDocument = require('pdfkit');

const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$'
};

/**
 * Helper to format amount as currency.
 * @param {number} amount 
 * @param {string} currencyCode 
 * @returns {string}
 */
const formatPDFCurrency = (amount, currencyCode) => {
  const symbol = currencySymbols[currencyCode.toUpperCase()] || currencyCode;
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${isNegative ? '-' : ''}${symbol} ${absAmount}`;
};

/**
 * Generate PDF document for transactions.
 * @param {Array<Object>} transactions - Pre-converted transactions.
 * @param {Object} user - User details.
 * @param {Object} filters - Applied filters.
 * @returns {PDFDocument}
 */
const generateTransactionPDF = (transactions, user, filters) => {
  const currencyCode = (filters.currency || user.preferredCurrency || user.currency || 'USD').toUpperCase();
  const dateRangeStr = filters.startDate && filters.endDate 
    ? `${new Date(filters.startDate).toLocaleDateString()} to ${new Date(filters.endDate).toLocaleDateString()}`
    : 'All-time';

  // 1. Initialize Document
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    bufferPages: true
  });

  // Calculate stats
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

    // Category breakdown logic
    if (!categoryMap[t.category]) {
      categoryMap[t.category] = { amount: 0, count: 0 };
    }
    categoryMap[t.category].amount += amt;
    categoryMap[t.category].count += 1;
  });

  const netBalance = totalIncome - totalExpense;

  // Render Header
  const renderHeader = (document) => {
    document.save();
    
    // Logo / Emoji Banner
    document.fontSize(24).text('💰', 50, 45, { continued: true });
    document.fillColor('#0f172a')
      .fontSize(18)
      .font('Helvetica-Bold')
      .text(' Expense Tracker — Financial Report', 75, 48);
    
    // Sub-info
    document.font('Helvetica')
      .fontSize(9)
      .fillColor('#64748b')
      .text(`User: ${user.name} (${user.email})`, 50, 75)
      .text(`Report Period: ${dateRangeStr}`, 50, 88)
      .text(`Generated: ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`, 50, 101, { align: 'right' });
    
    // Horizontal divider
    document.strokeColor('#cbd5e1')
      .lineWidth(1)
      .moveTo(50, 115)
      .lineTo(545, 115)
      .stroke();
    
    document.restore();
  };

  // Render Summary Cards
  const renderSummaryCards = (document, startY) => {
    document.save();
    
    const cardWidth = 155;
    const cardHeight = 55;
    const spacing = 15;
    
    // Income Card
    let x = 50;
    document.roundedRect(x, startY, cardWidth, cardHeight, 8)
      .fillAndStroke('#f0fdf4', '#dcfce7');
    document.fillColor('#15803d').font('Helvetica-Bold').fontSize(9).text('TOTAL INCOME', x + 10, startY + 12);
    document.fillColor('#166534').font('Helvetica-Bold').fontSize(12).text(formatPDFCurrency(totalIncome, currencyCode), x + 10, startY + 28);

    // Expense Card
    x += cardWidth + spacing;
    document.roundedRect(x, startY, cardWidth, cardHeight, 8)
      .fillAndStroke('#fef2f2', '#fee2e2');
    document.fillColor('#b91c1c').font('Helvetica-Bold').fontSize(9).text('TOTAL EXPENSE', x + 10, startY + 12);
    document.fillColor('#991b1b').font('Helvetica-Bold').fontSize(12).text(formatPDFCurrency(totalExpense, currencyCode), x + 10, startY + 28);

    // Net Balance Card
    x += cardWidth + spacing;
    const balColorBg = netBalance >= 0 ? '#eff6ff' : '#fff7ed';
    const balColorBorder = netBalance >= 0 ? '#dbeafe' : '#ffedd5';
    const balColorText = netBalance >= 0 ? '#1d4ed8' : '#c2410c';
    const balColorValue = netBalance >= 0 ? '#1e40af' : '#9a3412';
    
    document.roundedRect(x, startY, cardWidth, cardHeight, 8)
      .fillAndStroke(balColorBg, balColorBorder);
    document.fillColor(balColorText).font('Helvetica-Bold').fontSize(9).text('NET BALANCE', x + 10, startY + 12);
    document.fillColor(balColorValue).font('Helvetica-Bold').fontSize(12).text(formatPDFCurrency(netBalance, currencyCode), x + 10, startY + 28);

    document.restore();
  };

  // Render Table Headers
  const renderTableHeaders = (document, y) => {
    document.save();
    document.fillColor('#f8fafc').rect(50, y, 495, 20).fill();
    document.strokeColor('#cbd5e1').rect(50, y, 495, 20).stroke();
    
    document.fillColor('#1e293b').font('Helvetica-Bold').fontSize(9);
    document.text('Date', 60, y + 6, { width: 55 });
    document.text('Title', 120, y + 6, { width: 155 });
    document.text('Category', 285, y + 6, { width: 95 });
    document.text('Type', 390, y + 6, { width: 55 });
    document.text('Amount', 450, y + 6, { width: 85, align: 'right' });
    document.restore();
  };

  // Draw Page Header & Cards on Page 1
  renderHeader(doc);
  renderSummaryCards(doc, 130);
  
  // Start Table
  let currentY = 205;
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(12).text('Transactions List', 50, currentY);
  currentY += 20;

  renderTableHeaders(doc, currentY);
  currentY += 20;

  doc.font('Helvetica').fontSize(9);

  transactions.forEach((t, index) => {
    // Check if we need to wrap page
    if (currentY > 730) {
      doc.addPage();
      currentY = 50;
      renderTableHeaders(doc, currentY);
      currentY += 20;
    }

    const amt = t.convertedAmount !== undefined ? t.convertedAmount : t.amount;
    const typeLabel = t.type === 'income' ? 'Income' : 'Expense';
    const dateStr = new Date(t.date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });

    // Color code row background
    const isEven = index % 2 === 0;
    const rowBg = t.type === 'income' 
      ? (isEven ? '#f0fdf4' : '#f8fafc') // light green fallback or white
      : (isEven ? '#fef2f2' : '#f8fafc'); // light red fallback or white
    
    const rowBorder = t.type === 'income' ? '#dcfce7' : '#fee2e2';

    doc.save();
    // Fill Row Background
    doc.fillColor(rowBg).rect(50, currentY, 495, 20).fill();
    // Draw thin bottom border
    doc.strokeColor(rowBorder).lineWidth(0.5).moveTo(50, currentY + 20).lineTo(545, currentY + 20).stroke();

    // Render Text Cells
    doc.fillColor('#0f172a');
    doc.text(dateStr, 60, currentY + 6, { width: 55 });
    doc.text(t.title, 120, currentY + 6, { width: 155, height: 10, ellipsis: true });
    doc.text(t.category, 285, currentY + 6, { width: 95, height: 10, ellipsis: true });
    
    // Type cell with matching color
    const typeColor = t.type === 'income' ? '#166534' : '#991b1b';
    doc.fillColor(typeColor).font('Helvetica-Bold').text(typeLabel, 390, currentY + 6, { width: 55 });
    
    // Amount cell
    doc.font('Helvetica-Bold').text(formatPDFCurrency(amt, currencyCode), 450, currentY + 6, { width: 85, align: 'right' });
    
    doc.restore();
    currentY += 20;
  });

  // Category Breakdown Section
  // Check if we need a new page for breakdown
  if (currentY > 580) {
    doc.addPage();
    currentY = 50;
  } else {
    currentY += 25;
  }

  doc.save();
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(12).text('Category Breakdown', 50, currentY);
  currentY += 20;

  // Categories Header
  doc.fillColor('#f8fafc').rect(50, currentY, 495, 20).fill();
  doc.strokeColor('#cbd5e1').rect(50, currentY, 495, 20).stroke();
  doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(9);
  doc.text('Category', 60, currentY + 6, { width: 150 });
  doc.text('Transactions Count', 220, currentY + 6, { width: 120, align: 'center' });
  doc.text('Total Amount', 350, currentY + 6, { width: 100, align: 'right' });
  doc.text('Share (%)', 460, currentY + 6, { width: 75, align: 'right' });
  currentY += 20;

  doc.font('Helvetica').fontSize(9);
  const totalVolume = totalIncome + totalExpense;

  Object.entries(categoryMap).forEach(([catName, data], index) => {
    if (currentY > 730) {
      doc.addPage();
      currentY = 50;
    }

    const share = totalVolume > 0 ? ((data.amount / totalVolume) * 100).toFixed(1) : '0.0';
    const isEven = index % 2 === 0;
    const rowBg = isEven ? '#f8fafc' : '#ffffff';

    doc.save();
    doc.fillColor(rowBg).rect(50, currentY, 495, 20).fill();
    doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(50, currentY + 20).lineTo(545, currentY + 20).stroke();
    
    doc.fillColor('#0f172a');
    doc.text(catName, 60, currentY + 6, { width: 150 });
    doc.text(String(data.count), 220, currentY + 6, { width: 120, align: 'center' });
    doc.font('Helvetica-Bold').text(formatPDFCurrency(data.amount, currencyCode), 350, currentY + 6, { width: 100, align: 'right' });
    doc.font('Helvetica').text(`${share}%`, 460, currentY + 6, { width: 75, align: 'right' });
    doc.restore();
    
    currentY += 20;
  });
  doc.restore();

  // Add Page Numbers Dynamically at the bottom of all pages
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.save();
    // Thin line above footer
    doc.strokeColor('#e2e8f0')
      .lineWidth(0.5)
      .moveTo(50, doc.page.height - 40)
      .lineTo(545, doc.page.height - 40)
      .stroke();

    doc.fontSize(8)
      .fillColor('#64748b')
      .text(
        `Expense Tracker | Financial Report | Page ${i + 1} of ${range.count}`,
        50,
        doc.page.height - 30,
        { align: 'center', width: doc.page.width - 100 }
      );
    doc.restore();
  }

  doc.end();
  return doc;
};

module.exports = {
  generateTransactionPDF
};
