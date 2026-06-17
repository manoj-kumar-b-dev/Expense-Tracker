/**
 * @file useCurrency.js
 * @description Hook to consume CurrencyContext easily in any child component.
 */

import { useContext } from 'react';
import CurrencyContext from '../context/CurrencyContext';

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export default useCurrency;
