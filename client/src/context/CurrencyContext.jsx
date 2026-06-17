/**
 * @file CurrencyContext.jsx
 * @description Context Provider managing currency rates fetching, offline local caching, preferred profile currency syncing, and client-side conversion logic.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const { user } = useAuth();
  const [rates, setRates] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [preferredCurrency, setPreferredCurrency] = useState('USD');
  const [displayCurrency, setDisplayCurrency] = useState('USD');

  // Sync state values with user profile setting changes
  useEffect(() => {
    if (user) {
      const userCurrency = user.preferredCurrency || user.currency || 'USD';
      setPreferredCurrency(userCurrency);
      setDisplayCurrency(userCurrency);
    }
  }, [user]);

  // Fetch exchange rates from backend
  const fetchRates = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/currency/rates');
      if (res.data && res.data.success) {
        const ratesData = res.data.data.rates;
        setRates(ratesData);
        localStorage.setItem('currency_rates', JSON.stringify(ratesData));
        localStorage.setItem('currency_rates_fetched_at', Date.now().toString());
      }
    } catch (err) {
      console.error('Failed to fetch currency rates from API:', err);
      
      // Fail-soft offline fallback: check if cached in localStorage
      const cachedRates = localStorage.getItem('currency_rates');
      if (cachedRates) {
        setRates(JSON.parse(cachedRates));
        toast.error('Unable to fetch live rates. Using cached offline data.');
      } else {
        toast.error('Failed to fetch currency exchange rates.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch rates if user is logged in
    if (!user) {
      setIsLoading(false);
      return;
    }

    const cachedRates = localStorage.getItem('currency_rates');
    const fetchedAt = localStorage.getItem('currency_rates_fetched_at');
    const oneDayInMs = 24 * 60 * 60 * 1000;

    // Load from cache if fetched within 24 hours, otherwise refresh
    if (cachedRates && fetchedAt && Date.now() - Number(fetchedAt) < oneDayInMs) {
      setRates(JSON.parse(cachedRates));
      setIsLoading(false);
    } else {
      fetchRates();
    }
  }, [user]);

  /**
   * Convert an amount from one currency to another using local rates cache.
   * @param {number} amount - Value to convert.
   * @param {string} fromCurrency - ISO starting currency code.
   * @param {string} toCurrency - ISO target currency code.
   * @returns {number} Converted amount.
   */
  const convert = (amount, fromCurrency, toCurrency) => {
    if (amount === undefined || amount === null || isNaN(amount)) return 0;
    const cleanFrom = (fromCurrency || 'USD').toUpperCase();
    const cleanTo = (toCurrency || 'USD').toUpperCase();
    if (cleanFrom === cleanTo) return amount;

    if (!rates || Object.keys(rates).length === 0) {
      return amount; // return unconverted if rates are not yet loaded
    }

    const fromRate = rates[cleanFrom];
    const toRate = rates[cleanTo];

    if (!fromRate || !toRate) {
      console.warn(`Rates for conversion from ${cleanFrom} to ${cleanTo} not loaded yet.`);
      return amount;
    }

    // Since rates cache is relative to USD (1 USD = X rates[curr])
    // 1 cleanFrom = (toRate / fromRate) cleanTo
    return amount * (toRate / fromRate);
  };

  return (
    <CurrencyContext.Provider
      value={{
        rates,
        isLoading,
        preferredCurrency,
        displayCurrency,
        setDisplayCurrency,
        convert,
        refreshRates: fetchRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;
