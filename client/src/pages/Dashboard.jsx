/**
 * @file Dashboard.jsx
 * @description Central dashboard view displaying current statistics, monthly trend charts, recent transaction rows, and quick-add actions.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { StatCard } from '../components/cards/StatCard';
import { TransactionCard } from '../components/cards/TransactionCard';
import { BarChartWrapper } from '../components/charts/BarChartWrapper';
import { SkeletonCard, SkeletonTable } from '../components/ui/Skeleton';
import api from '../api/axiosInstance';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  ArrowRight,
  TrendingUp as TrendUpIcon
} from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { transactions, loading, stats, fetchTransactions } = useTransactions();
  const [monthlyData, setMonthlyData] = useState([]);
  const [chartsLoading, setChartsLoading] = useState(false);

  // 1. Fetch dashboard transactions & monthly trend summaries on mount
  useEffect(() => {
    fetchTransactions({ page: 1, limit: 5 });

    const fetchMonthlyAnalytics = async () => {
      setChartsLoading(true);
      try {
        const res = await api.get('/analytics/monthly');
        setMonthlyData(res.data.data);
      } catch (err) {
        console.error('Failed to load monthly analytics charts data:', err);
      } finally {
        setChartsLoading(false);
      }
    };

    fetchMonthlyAnalytics();
  }, [fetchTransactions]);

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn relative pb-20">
      {/* 1. Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left">
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Financial Dashboard
          </h2>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Real-time tracking of your income, expenses, and savings health.
          </p>
        </div>
      </div>

      {/* 2. Statistical cards summary row */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Balance"
            value={stats.balance || 0}
            icon={Wallet}
            variant="primary"
          />
          <StatCard
            title="Total Income"
            value={stats.income || 0}
            icon={TrendingUp}
            variant="success"
          />
          <StatCard
            title="Total Expense"
            value={stats.expense || 0}
            icon={TrendingDown}
            variant="danger"
          />
        </div>
      )}

      {/* 3. Primary Analytical and Listing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recharts Monthly bar analysis */}
        <div className="lg:col-span-2 glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200/50 dark:border-gray-800/40">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Monthly Trends Summary
            </h3>
            <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Income vs Expenses
            </span>
          </div>
          {chartsLoading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="animate-pulse w-full h-full bg-gray-200/20 dark:bg-gray-800/20 rounded-xl" />
            </div>
          ) : (
            <BarChartWrapper data={monthlyData} />
          )}
        </div>

        {/* Right Column: Recent 5 Transactions ledger */}
        <div className="glass-panel p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200/50 dark:border-gray-800/40">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Recent Activities
              </h3>
              <button
                onClick={() => navigate('/transactions')}
                className="text-xs font-bold text-primary hover:text-primary-light flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3 shrink-0" />
              </button>
            </div>

            {/* List */}
            {loading ? (
              <SkeletonTable rows={3} />
            ) : transactions.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center space-y-2">
                <span className="text-2xl">📝</span>
                <p className="text-xs font-semibold text-gray-400">No recent transactions recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((trans) => (
                  <TransactionCard key={trans._id} transaction={trans} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Quick-add Floating Action Button (FAB) */}
      <button
        onClick={() => navigate('/transactions/add')}
        className="fixed bottom-8 right-8 z-30 bg-primary hover:bg-primary-light text-white p-4 rounded-full shadow-2xl shadow-primary/45 hover:scale-110 active:scale-95 transition-all duration-200 group flex items-center gap-2"
        title="Add Transaction"
      >
        <Plus className="w-6 h-6 shrink-0" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold text-sm tracking-wide leading-none whitespace-nowrap">
          Quick Add
        </span>
      </button>
    </div>
  );
};

export default Dashboard;
