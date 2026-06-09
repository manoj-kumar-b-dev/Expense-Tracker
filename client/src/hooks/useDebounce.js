/**
 * @file useDebounce.js
 * @description Hook to debounce state values during text changes.
 */

import { useState, useEffect } from 'react';

/**
 * Debounces a value over a given delay timeframe.
 * @param {*} value - Initial state value.
 * @param {number} [delay=500] - Timeframe to wait before updating in milliseconds.
 * @returns {*} Debounced state value.
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear timeout on value changes or unmounting
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
