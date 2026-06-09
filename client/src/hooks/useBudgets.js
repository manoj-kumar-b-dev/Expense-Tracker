/**
 * @file useBudgets.js
 * @description Custom hook to manage budget records and real-time category status trackers.
 */

import { useState, useCallback } from 'react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

export const useBudgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch budgets for a given month/year
  const fetchBudgets = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/budgets', { params });
      setBudgets(res.data.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch budgets';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch budget utilization statuses
  const fetchBudgetStatus = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/budgets/status', { params });
      setBudgetStatus(res.data.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to calculate budget status';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Add a budget limit
  const addBudget = async (budgetData) => {
    setLoading(true);
    try {
      const res = await api.post('/budgets', budgetData);
      toast.success(res.data.message || 'Budget target registered');
      
      // Update budgets list state locally
      setBudgets(prev => [res.data.data, ...prev]);
      return res.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to configure budget';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 4. Update a budget limit
  const editBudget = async (id, budgetData) => {
    setLoading(true);
    try {
      const res = await api.put(`/budgets/${id}`, budgetData);
      toast.success(res.data.message || 'Budget target adjusted');
      
      // Update states locally
      setBudgets(prev => prev.map(b => b._id === id ? res.data.data : b));
      return res.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update budget';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 5. Delete a budget
  const removeBudget = async (id) => {
    setLoading(true);
    try {
      const res = await api.delete(`/budgets/${id}`);
      toast.success(res.data.message || 'Budget plan removed');
      
      // Update state locally
      setBudgets(prev => prev.filter(b => b._id !== id));
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove budget';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    budgets,
    budgetStatus,
    loading,
    error,
    fetchBudgets,
    fetchBudgetStatus,
    addBudget,
    editBudget,
    removeBudget,
  };
};
