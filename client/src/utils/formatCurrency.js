/**
 * @file formatCurrency.js
 * @description Standard currency formatting utility.
 */

/**
 * Formats a numeric value into a locale-aware currency representation.
 * @param {number} amount - Numeric value to format.
 * @param {string} [currency='USD'] - ISO currency code (USD, EUR, GBP, INR, etc).
 * @returns {string} Formatted currency string.
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null) return '';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch (error) {
    // Fallback in case of invalid ISO code
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
};
