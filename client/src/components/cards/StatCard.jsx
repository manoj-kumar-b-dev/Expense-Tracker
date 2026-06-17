/**
 * @file StatCard.jsx
 * @description Stats summary card featuring gradient borders and mounted counter increments.
 */

import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../hooks/useCurrency';

/**
 * Animated counter that counts up to a target number on mount.
 * @component AnimatedCounter
 */
const AnimatedCounter = ({ target, currency }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(target) || 0;
    if (end === 0) {
      setCount(0);
      return;
    }

    const duration = 1000; // 1s animation duration
    const stepTime = 16; // roughly 60fps
    const totalSteps = duration / stepTime;
    const increment = end / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  return <>{formatCurrency(count, currency)}</>;
};

/**
 * Premium StatCard displaying numerical data with custom iconography.
 * @component StatCard
 */
export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend, // e.g., { type: 'up'|'down', value: '12.4%' }
  variant = 'primary', // 'primary' | 'success' | 'danger' | 'warning'
  currency,
}) => {
  const { user } = useAuth();
  const { displayCurrency } = useCurrency();
  const activeCurrency = currency || displayCurrency || user?.preferredCurrency || user?.currency || 'USD';

  const variants = {
    primary: 'border-l-4 border-primary bg-primary/5 dark:bg-primary/10 text-primary',
    success: 'border-l-4 border-success bg-success/5 dark:bg-success/10 text-success',
    danger: 'border-l-4 border-danger bg-danger/5 dark:bg-danger/10 text-danger',
    warning: 'border-l-4 border-warning bg-warning/5 dark:bg-warning/10 text-warning',
  };

  const badgeVariants = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    danger: 'bg-danger/10 text-danger',
    warning: 'bg-warning/10 text-warning',
  };

  return (
    <div className={`glass-panel p-6 flex items-center justify-between border border-gray-200/50 dark:border-gray-800/40 relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${variants[variant]}`}>
      {/* Visual background accent glow */}
      <div className="absolute -top-10 -left-10 w-24 h-24 bg-current opacity-[0.03] rounded-full blur-xl pointer-events-none" />

      <div className="space-y-2.5 z-10">
        <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {title}
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none flex items-baseline gap-2">
          <AnimatedCounter target={value} currency={activeCurrency} />
          <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-500 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
            {activeCurrency}
          </span>
        </h2>

        {/* Optional Trend indicator */}
        {trend && (
          <div className="flex items-center gap-1 mt-1 text-xs">
            <span className={`font-bold ${trend.type === 'up' ? 'text-success' : 'text-danger'}`}>
              {trend.type === 'up' ? '▲' : '▼'} {trend.value}
            </span>
            <span className="text-gray-500 dark:text-gray-400 font-medium">vs last month</span>
          </div>
        )}
      </div>

      {Icon && (
        <div className={`p-4 rounded-xl flex items-center justify-center shrink-0 border border-white/20 dark:border-white/5 shadow-inner ${badgeVariants[variant]}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

export default StatCard;
