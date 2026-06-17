/**
 * @file RecurringCard.jsx
 * @description Card component representing a single recurring transaction rule.
 * Shows: title, amount + currency, frequency badge, next run date, and status indicator.
 * Color-coded: green border = active, gray border = paused.
 */

import React, { useState } from 'react';
import { Repeat2, Pencil, Trash2, Play, Pause, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { CategoryIconBadge } from '../../utils/categoryIcons';
import { formatAmount } from '../../utils/formatCurrency';

const FREQUENCY_LABELS = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

const FREQUENCY_COLORS = {
  daily: 'danger',
  weekly: 'warning',
  monthly: 'primary',
  yearly: 'success',
};

/**
 * @component RecurringCard
 * @param {Object} rule - RecurringTransaction document
 * @param {Function} onEdit - Opens edit modal with this rule
 * @param {Function} onDelete - Deletes this rule after confirmation
 * @param {Function} onToggle - Pauses or resumes this rule
 */
export const RecurringCard = ({ rule, onEdit, onDelete, onToggle }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isActive = rule.isActive;
  const nextDate = rule.nextExecutionDate
    ? new Date(rule.nextExecutionDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : '—';

  const lastDate = rule.lastExecutedDate
    ? new Date(rule.lastExecutedDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : 'Never';

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(rule._id);
    } else {
      setConfirmDelete(true);
      // Auto-cancel confirmation after 4s
      setTimeout(() => setConfirmDelete(false), 4000);
    }
  };

  return (
    <div
      className={`
        glass-card p-5 flex flex-col gap-3 transition-all duration-300
        border-l-4 ${isActive ? 'border-l-success' : 'border-l-gray-400 dark:border-l-gray-600 opacity-80'}
      `}
    >
      {/* ── Top Row: Icon + Title + Status + Amount ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <CategoryIconBadge category={rule.category} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white truncate">
                {rule.title}
              </h3>
              <span className="text-base" title="Recurring">🔁</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <Badge variant={FREQUENCY_COLORS[rule.frequency] || 'default'}>
                {FREQUENCY_LABELS[rule.frequency]}
              </Badge>
              <Badge variant={rule.type === 'income' ? 'success' : 'danger'}>
                {rule.type}
              </Badge>
              <Badge variant={isActive ? 'success' : 'default'}>
                {isActive ? '● Active' : '○ Paused'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="text-right shrink-0">
          <span
            className={`block text-lg font-black tracking-tight ${
              rule.type === 'income' ? 'text-success' : 'text-danger'
            }`}
          >
            {rule.type === 'income' ? '+' : '−'}
            {formatAmount(rule.amount, rule.currency)}
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase">{rule.currency}</span>
        </div>
      </div>

      {/* ── Middle Row: Next Run Date ── */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-semibold">
        <Calendar className="w-3.5 h-3.5 shrink-0 text-primary dark:text-primary-light" />
        <span>Next run:</span>
        <span className="text-gray-800 dark:text-gray-200 font-bold">{nextDate}</span>
      </div>

      {/* ── Expandable Details ── */}
      {expanded && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200/40 dark:border-gray-800/40 pt-3 animate-fadeIn">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Category</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">{rule.category}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Last Run</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">{lastDate}</span>
          </div>
          {rule.endDate && (
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">End Date</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {new Date(rule.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
          {rule.notes && (
            <div className="col-span-2">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Notes</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{rule.notes}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Action Bar ── */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-200/40 dark:border-gray-800/40">
        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? 'Less' : 'Details'}
        </button>

        <div className="flex items-center gap-1.5">
          {/* Edit */}
          <button
            onClick={() => onEdit(rule)}
            title="Edit rule"
            className="p-2 rounded-lg text-gray-500 hover:bg-primary/10 hover:text-primary dark:hover:text-primary-light transition-all duration-200"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {/* Pause / Resume */}
          <button
            onClick={() => onToggle(rule._id)}
            title={isActive ? 'Pause rule' : 'Resume rule'}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isActive
                ? 'text-warning hover:bg-warning/10'
                : 'text-success hover:bg-success/10'
            }`}
          >
            {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Delete with two-step confirmation */}
          <button
            onClick={handleDeleteClick}
            title={confirmDelete ? 'Click again to confirm delete' : 'Delete rule'}
            className={`p-2 rounded-lg transition-all duration-200 ${
              confirmDelete
                ? 'bg-danger text-white scale-105'
                : 'text-danger hover:bg-danger/10'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecurringCard;
