/**
 * @file BudgetCard.jsx
 * @description Category spending budget card displaying monthly caps, spent sums, progress tracks, and limit flags.
 */

import React, { useEffect, useState } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { getCategoryMeta } from '../../utils/categoryIcons';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, Edit, Trash2 } from 'lucide-react';

/**
 * Visual budget card showcasing limit progression.
 * @component BudgetCard
 */
export const BudgetCard = ({
  budgetStatusItem,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  const activeCurrency = user?.currency || 'USD';
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const {
    _id,
    category,
    monthlyLimit,
    spent,
    utilizationRate,
    status
  } = budgetStatusItem;

  const meta = getCategoryMeta(category);
  const IconComponent = meta.icon;

  // Animate progress bar on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      // Clamp between 0 and 100 for visual display in progress bar
      const clamped = Math.min(Math.max(utilizationRate, 0), 100);
      setAnimatedProgress(clamped);
    }, 100);
    return () => clearTimeout(timer);
  }, [utilizationRate]);

  // Color progress bar depending on percentage thresholds
  const getProgressColor = () => {
    if (utilizationRate >= 90) return 'bg-danger';
    if (utilizationRate >= 75) return 'bg-warning';
    return 'bg-success';
  };

  // Get status color for labels
  const getStatusTextColor = () => {
    if (utilizationRate >= 90) return 'text-danger dark:text-danger/90';
    if (utilizationRate >= 75) return 'text-warning dark:text-warning/90';
    return 'text-success dark:text-success/90';
  };

  const isExceeded = utilizationRate >= 100;
  const isWarning = utilizationRate >= 75 && !isExceeded;

  return (
    <div className={`glass-panel p-5 relative border border-gray-200/50 dark:border-gray-800/40 space-y-4 hover:shadow-2xl transition-all duration-300 ${isExceeded ? 'ring-1 ring-danger/45 bg-danger/[0.01]' : ''}`}>
      {/* Title block */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${meta.bg} ${meta.color} ${meta.border}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="text-left leading-none">
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 tracking-wide">
              {category}
            </h4>
            <span className="block text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mt-0.5 tracking-wider">
              Budget Category
            </span>
          </div>
        </div>

        {/* Action icons */}
        {(onEdit || onDelete) && _id && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(budgetStatusItem)}
                className="text-gray-400 hover:text-primary p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Edit Budget"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(_id)}
                className="text-gray-400 hover:text-danger p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Remove Budget"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Numerical status */}
      <div className="space-y-1 text-left">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {formatCurrency(spent, activeCurrency)}
          </span>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide">
            of {formatCurrency(monthlyLimit, activeCurrency)} limit
          </span>
        </div>

        {/* Progress Bar container */}
        <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800/80 rounded-full overflow-hidden relative border border-gray-200/20 dark:border-gray-700/10">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor()}`}
            style={{ width: `${animatedProgress}%` }}
          />
        </div>

        {/* Metrics summary labels */}
        <div className="flex items-center justify-between text-[11px] font-bold tracking-wide pt-0.5">
          <span className={`uppercase font-extrabold ${getStatusTextColor()}`}>
            {Math.round(utilizationRate)}% used
          </span>
          {monthlyLimit > 0 && (
            <span className="text-gray-400 dark:text-gray-500 font-semibold uppercase">
              {formatCurrency(Math.max(monthlyLimit - spent, 0), activeCurrency)} left
            </span>
          )}
        </div>
      </div>

      {/* Alert indicators */}
      {isExceeded && (
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-danger/10 border border-danger/20 text-danger text-[10px] font-bold tracking-wide uppercase leading-none animate-pulse">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Category budget exceeded! Minimize expenses.</span>
        </div>
      )}
      {isWarning && (
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-warning/10 border border-warning/20 text-warning text-[10px] font-bold tracking-wide uppercase leading-none">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Warning: Approaching category limit.</span>
        </div>
      )}
    </div>
  );
};

export default BudgetCard;
