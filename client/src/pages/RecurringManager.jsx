/**
 * @file RecurringManager.jsx
 * @description Dedicated page for managing all recurring transaction rules.
 * Users can create, edit, pause/resume, and delete recurring rules.
 * Accessible via sidebar "Recurring" menu item at /recurring.
 */

import React, { useEffect, useState } from 'react';
import { Repeat2, Plus, RefreshCw, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { useRecurring } from '../hooks/useRecurring';
import { RecurringCard } from '../components/cards/RecurringCard';
import { RecurringFormModal } from '../components/RecurringFormModal';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';

export const RecurringManager = () => {
  const { user } = useAuth();
  const defaultCurrency = user?.preferredCurrency || user?.currency || 'USD';

  const {
    rules, loading, fetchRules, createRule, updateRule, deleteRule, toggleRule,
  } = useRecurring();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = create, object = edit
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'paused'

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleOpenCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (rule) => {
    setEditTarget(rule);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editTarget) {
        await updateRule(editTarget._id, formData);
      } else {
        await createRule(formData);
      }
      handleCloseModal();
    } catch {
      // toast is handled inside the hook
    } finally {
      setSubmitting(false);
    }
  };

  // Summary stats
  const activeCount = rules.filter((r) => r.isActive).length;
  const pausedCount = rules.filter((r) => !r.isActive).length;
  const monthlyExpense = rules
    .filter((r) => r.isActive && r.type === 'expense' && r.frequency === 'monthly')
    .reduce((sum, r) => sum + r.amount, 0);
  const monthlyIncome = rules
    .filter((r) => r.isActive && r.type === 'income' && r.frequency === 'monthly')
    .reduce((sum, r) => sum + r.amount, 0);

  const filteredRules = rules.filter((r) => {
    if (filter === 'active') return r.isActive;
    if (filter === 'paused') return !r.isActive;
    return true;
  });

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn pb-20">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left">
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Recurring Rules
          </h2>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Automate predictable income and expense entries. Never miss a recurring transaction.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchRules}
            disabled={loading}
            title="Refresh"
            className="p-2.5 rounded-xl border border-gray-200/50 dark:border-gray-800/40 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add Recurring</span>
          </button>
        </div>
      </div>

      {/* ── Summary Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Active Rules',
            value: activeCount,
            sub: `${pausedCount} paused`,
            icon: Zap,
            accent: 'text-primary border-primary/20 bg-primary/5 dark:bg-primary/10',
            iconBg: 'bg-primary/10 text-primary',
          },
          {
            label: 'Paused Rules',
            value: pausedCount,
            sub: 'click resume to reactivate',
            icon: Repeat2,
            accent: 'text-gray-500 border-gray-200/50 bg-gray-50/50 dark:bg-gray-800/20',
            iconBg: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
          },
          {
            label: 'Monthly Expenses',
            value: `${defaultCurrency} ${monthlyExpense.toFixed(0)}`,
            sub: 'from active monthly rules',
            icon: TrendingDown,
            accent: 'text-danger border-danger/20 bg-danger/5 dark:bg-danger/10',
            iconBg: 'bg-danger/10 text-danger',
          },
          {
            label: 'Monthly Income',
            value: `${defaultCurrency} ${monthlyIncome.toFixed(0)}`,
            sub: 'from active monthly rules',
            icon: TrendingUp,
            accent: 'text-success border-success/20 bg-success/5 dark:bg-success/10',
            iconBg: 'bg-success/10 text-success',
          },
        ].map(({ label, value, sub, icon: Icon, accent, iconBg }) => (
          <div
            key={label}
            className={`glass-panel p-4 border flex items-center justify-between gap-3 ${accent}`}
          >
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
              <span className="block text-lg font-black tracking-tight mt-0.5">{value}</span>
              <span className="block text-[10px] font-semibold text-gray-400 mt-0.5">{sub}</span>
            </div>
            <div className={`p-3 rounded-xl shrink-0 ${iconBg}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-2">
        {[
          { key: 'all', label: `All (${rules.length})` },
          { key: 'active', label: `Active (${activeCount})` },
          { key: 'paused', label: `Paused (${pausedCount})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
              filter === key
                ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                : 'border-gray-200/50 dark:border-gray-800/40 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Rules Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredRules.length === 0 ? (
        /* Empty State */
        <div className="glass-panel p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="text-5xl">🔁</div>
          <div>
            <h3 className="text-base font-extrabold text-gray-800 dark:text-white">
              {filter === 'all' ? 'No recurring rules yet' : `No ${filter} rules`}
            </h3>
            <p className="text-xs font-semibold text-gray-400 mt-1 max-w-xs">
              {filter === 'all'
                ? 'Create your first recurring rule for rent, salary, subscriptions, and more — the cron engine will handle the rest.'
                : `No ${filter} recurring rules to show. Switch to "All" to see everything.`}
            </p>
          </div>
          {filter === 'all' && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-light shadow-lg shadow-primary/20 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4 shrink-0" />
              Create First Rule
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredRules.map((rule) => (
            <RecurringCard
              key={rule._id}
              rule={rule}
              onEdit={handleOpenEdit}
              onDelete={deleteRule}
              onToggle={toggleRule}
            />
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      <RecurringFormModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editData={editTarget}
        isLoading={submitting}
        defaultCurrency={defaultCurrency}
      />
    </div>
  );
};

export default RecurringManager;
