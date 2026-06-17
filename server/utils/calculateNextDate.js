/**
 * @file calculateNextDate.js
 * @description Pure utility function to advance a date by a given recurring frequency.
 * Handles month-end overflow edge cases (e.g., Jan 31 → Feb 28, not Mar 3).
 */

/**
 * Calculates the next execution date for a recurring transaction based on frequency.
 * Safely handles month-end overflow by clamping to the last valid day of the target month.
 *
 * @param {Date} currentDate - The current execution date to advance from.
 * @param {string} frequency - One of: 'daily' | 'weekly' | 'monthly' | 'yearly'.
 * @returns {Date} The calculated next execution date.
 */
const calculateNextDate = (currentDate, frequency) => {
  // Work with a clean copy to avoid mutating the input
  const date = new Date(currentDate);

  switch (frequency) {
    case 'daily': {
      date.setUTCDate(date.getUTCDate() + 1);
      break;
    }

    case 'weekly': {
      date.setUTCDate(date.getUTCDate() + 7);
      break;
    }

    case 'monthly': {
      // Remember the original day-of-month to handle month-end overflow
      const originalDay = date.getUTCDate();
      const targetMonth = date.getUTCMonth() + 1; // advance by 1 month (wraps at 12 → 0)
      const targetYear = targetMonth > 11 ? date.getUTCFullYear() + 1 : date.getUTCFullYear();
      const normalizedMonth = targetMonth > 11 ? 0 : targetMonth;

      // Find the last day of the target month by jumping to day 0 of the following month
      const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, normalizedMonth + 1, 0)).getUTCDate();

      // Clamp: if original day was 31 and target month only has 28 days, use 28
      const clampedDay = Math.min(originalDay, lastDayOfTargetMonth);

      date.setUTCFullYear(targetYear, normalizedMonth, clampedDay);
      break;
    }

    case 'yearly': {
      const originalDay = date.getUTCDate();
      const originalMonth = date.getUTCMonth();
      const nextYear = date.getUTCFullYear() + 1;

      // Handle leap year edge case: Feb 29 in a non-leap year → Feb 28
      const lastDayOfTargetMonth = new Date(Date.UTC(nextYear, originalMonth + 1, 0)).getUTCDate();
      const clampedDay = Math.min(originalDay, lastDayOfTargetMonth);

      date.setUTCFullYear(nextYear, originalMonth, clampedDay);
      break;
    }

    default:
      throw new Error(`Unknown frequency: "${frequency}". Must be daily | weekly | monthly | yearly.`);
  }

  return date;
};

module.exports = calculateNextDate;
