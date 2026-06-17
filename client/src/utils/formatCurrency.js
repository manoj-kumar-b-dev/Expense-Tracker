/**
 * @file formatCurrency.js
 * @description Custom currency formatting utility.
 */

const CURRENCY_LOCALES = {
  USD: 'en-US',
  EUR: 'en-IE', // yields €1,234.56
  GBP: 'en-GB', // yields £1,234.56
  INR: 'en-IN', // yields ₹1,234.56
  JPY: 'ja-JP', // yields ¥1,235
  AUD: 'en-AU', // yields A$1,234.56
  CAD: 'en-CA', // yields C$1,234.56
};

/**
 * Formats a numeric value into a locale-aware currency representation.
 * @param {number} amount - Numeric value to format.
 * @param {string} [currency='USD'] - ISO currency code (USD, EUR, GBP, INR, etc).
 * @returns {string} Formatted currency string.
 */
export const formatAmount = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null) return '';
  
  const cleanCurrency = currency.toUpperCase();
  const locale = CURRENCY_LOCALES[cleanCurrency] || 'en-US';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: cleanCurrency,
    }).format(amount);
  } catch (error) {
    // Fallback in case of invalid ISO code or missing locale
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
};

/**
 * Formats a numeric value into a locale-aware currency representation (backward compatibility alias).
 * @param {number} amount - Numeric value to format.
 * @param {string} [currency='USD'] - ISO currency code.
 * @returns {string} Formatted currency string.
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return formatAmount(amount, currency);
};
