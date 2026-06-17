/**
 * @file Dashboard.jsx
 * @description Central dashboard view displaying current statistics, monthly trend charts, recent transaction rows, and quick-add actions.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { useRecurring } from '../hooks/useRecurring';
import { StatCard } from '../components/cards/StatCard';
import { TransactionCard } from '../components/cards/TransactionCard';
import { BarChartWrapper } from '../components/charts/BarChartWrapper';
import { SkeletonCard, SkeletonTable } from '../components/ui/Skeleton';
import api from '../api/axiosInstance';
import { useCurrency } from '../hooks/useCurrency';
import { formatAmount } from '../utils/formatCurrency';
import ExportModal from '../components/ExportModal';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  ArrowRight,
  TrendingUp as TrendUpIcon,
  Repeat2,
  CalendarClock,
  ArrowUpRight,
  ArrowDownRight,
  Download
} from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { transactions, loading, stats, fetchTransactions } = useTransactions();
  const { upcoming, upcomingSummary, fetchUpcoming } = useRecurring();
  const [monthlyData, setMonthlyData] = useState([]);
  const [chartsLoading, setChartsLoading] = useState(false);
  const { displayCurrency, setDisplayCurrency } = useCurrency();
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFilters, setExportFilters] = useState({});

  const openExportReport = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const pad = (num) => String(num).padStart(2, '0');
    const startDateStr = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-01`;
    const endDateStr = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;

    setExportFilters({
      startDate: startDateStr,
      endDate: endDateStr,
      type: 'all',
      currency: displayCurrency
    });
    setExportModalOpen(true);
  };

  // 1. Fetch dashboard transactions & monthly trend summaries when displayCurrency changes
  useEffect(() => {
    fetchTransactions({ page: 1, limit: 5, displayCurrency });
    fetchUpcoming();

    const fetchMonthlyAnalytics = async () => {
      setChartsLoading(true);
      try {
        const res = await api.get('/analytics/monthly', { params: { displayCurrency } });
        setMonthlyData(res.data.data);
      } catch (err) {
        console.error('Failed to load monthly analytics charts data:', err);
      } finally {
        setChartsLoading(false);
      }
    };

    fetchMonthlyAnalytics();
  }, [fetchTransactions, fetchUpcoming, displayCurrency]);

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

        {/* Currency Switcher Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-center bg-white/50 dark:bg-darkBg-card/50 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-gray-200/50 dark:border-gray-800/40 shadow-sm z-20">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Display Currency:</span>
          <select
            value={displayCurrency}
            onChange={(e) => setDisplayCurrency(e.target.value)}
            className="bg-transparent text-xs font-extrabold text-gray-850 dark:text-white border-none focus:outline-none cursor-pointer uppercase"
          >
            {['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'].map((curr) => (
              <option key={curr} value={curr} className="dark:bg-[#161C2A] dark:text-white">{curr}</option>
            ))}
          </select>
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

      {/* 2.5 Quick Actions Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-left">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Record Transaction Card */}
          <div
            onClick={() => navigate('/transactions/add')}
            className="glass-card p-5 flex items-center justify-between gap-4 cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-200 group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-white">Record Transaction</h4>
                <p className="text-[10px] font-semibold text-gray-400 mt-0.5">Add new income or expense</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-450 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Export Financial Report Card */}
          <div
            onClick={openExportReport}
            className="glass-card p-5 flex items-center justify-between gap-4 cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-200 group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-success/10 rounded-2xl text-success group-hover:scale-110 transition-transform">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-white">Export Financial Report</h4>
                <p className="text-[10px] font-semibold text-gray-400 mt-0.5">Download PDF, Excel, or CSV</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-450 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Manage Budgets Card */}
          <div
            onClick={() => navigate('/budget')}
            className="glass-card p-5 flex items-center justify-between gap-4 cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-200 group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-warning/10 rounded-2xl text-warning group-hover:scale-110 transition-transform">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-white">Manage Budgets</h4>
                <p className="text-[10px] font-semibold text-gray-400 mt-0.5">Set monthly category limits</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-450 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

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

      {/* 4. Upcoming This Month — Recurring Preview */}
      {upcoming.length > 0 && (
        <div className="glass-panel p-6 space-y-4">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200/50 dark:border-gray-800/40">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                <CalendarClock className="w-4 h-4 text-primary dark:text-primary-light" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-white">Upcoming This Month</h3>
                <p className="text-[10px] font-semibold text-gray-400">{upcoming.length} recurring transaction{upcoming.length !== 1 ? 's' : ''} scheduled in the next 30 days</p>
              </div>
            </div>
            {/* Summary Totals Pill */}
            <div className="flex items-center gap-3">
              {upcomingSummary.totalIncome > 0 && (
                <div className="flex items-center gap-1.5 bg-success/10 border border-success/20 px-3 py-1.5 rounded-xl">
                  <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                  <span className="text-xs font-bold text-success">
                    +{formatAmount(upcomingSummary.totalIncome, displayCurrency)}
                  </span>
                </div>
              )}
              {upcomingSummary.totalExpense > 0 && (
                <div className="flex items-center gap-1.5 bg-danger/10 border border-danger/20 px-3 py-1.5 rounded-xl">
                  <ArrowDownRight className="w-3.5 h-3.5 text-danger" />
                  <span className="text-xs font-bold text-danger">
                    -{formatAmount(upcomingSummary.totalExpense, displayCurrency)}
                  </span>
                </div>
              )}
              <button
                onClick={() => navigate('/recurring')}
                className="text-xs font-bold text-primary hover:text-primary-light flex items-center gap-1 transition-colors"
              >
                <span>Manage</span>
                <ArrowRight className="w-3 h-3 shrink-0" />
              </button>
            </div>
          </div>

          {/* Upcoming Rows */}
          <div className="space-y-2">
            {upcoming.slice(0, 8).map((rule) => {
              const execDate = new Date(rule.nextExecutionDate);
              const isToday = execDate.toDateString() === new Date().toDateString();
              return (
                <div
                  key={rule._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-darkBg-card/30 border border-gray-200/30 dark:border-gray-800/30 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                      <Repeat2 className="w-3.5 h-3.5 text-primary dark:text-primary-light" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{rule.title}</span>
                      <span className="block text-[10px] font-semibold text-gray-400 capitalize">{rule.frequency} · {rule.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-black tracking-tight ${
                        rule.type === 'income' ? 'text-success' : 'text-danger'
                      }`}
                    >
                      {rule.type === 'income' ? '+' : '−'}{formatAmount(rule.amount, rule.currency)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                        isToday
                          ? 'bg-warning/15 text-warning'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                      }`}
                    >
                      {isToday ? 'Today' : execDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Quick-add Floating Action Button (FAB) */}
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

      {/* Export Options Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        initialFormat="pdf"
        initialFilters={exportFilters}
      />
    </div>
  );
};

export default Dashboard;
