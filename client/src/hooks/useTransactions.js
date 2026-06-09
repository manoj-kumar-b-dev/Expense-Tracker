/**
 * @file useTransactions.js
 * @description Custom hook for all transactions data actions, filtering, and streaming CSV downloads.
 */

import { useState, useCallback } from 'react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 10 });
  const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });

  // 1. Fetch transactions with filters
  const fetchTransactions = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/transactions', { params });
      const { data, pagination: pag, stats: st } = res.data;
      setTransactions(data);
      setPagination(pag);
      setStats(st);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch transactions';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Add transaction
  const addTransaction = async (transactionData) => {
    setLoading(true);
    try {
      const res = await api.post('/transactions', transactionData);
      toast.success(res.data.message || 'Transaction recorded!');
      return res.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to record transaction';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 3. Edit transaction
  const editTransaction = async (id, transactionData) => {
    setLoading(true);
    try {
      const res = await api.put(`/transactions/${id}`, transactionData);
      toast.success(res.data.message || 'Transaction updated!');
      
      // Update state locally
      setTransactions(prev => prev.map(t => t._id === id ? res.data.data : t));
      return res.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update transaction';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 4. Delete transaction
  const removeTransaction = async (id) => {
    setLoading(true);
    try {
      const res = await api.delete(`/transactions/${id}`);
      toast.success(res.data.message || 'Transaction deleted');
      
      // Update state locally
      setTransactions(prev => prev.filter(t => t._id !== id));
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete transaction';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 5. Trigger download of transactions CSV
  const exportCSV = async (params = {}) => {
    try {
      const res = await api.get('/transactions/export/csv', {
        params,
        responseType: 'blob', // Request standard binary blob response
      });

      // Bind data to clickable download element in document
      const blob = new Blob([res.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up DOM components
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('CSV file downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate CSV export file');
    }
  };

  return {
    transactions,
    loading,
    error,
    pagination,
    stats,
    fetchTransactions,
    addTransaction,
    editTransaction,
    removeTransaction,
    exportCSV,
  };
};
