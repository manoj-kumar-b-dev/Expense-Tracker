/**
 * @file TransactionCard.jsx
 * @description Card representing a compact transaction ledger item.
 */

import React from 'react';
import { CategoryIconBadge } from '../../utils/categoryIcons';
import { formatAmount } from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../hooks/useCurrency';
import { Calendar, Trash2, Edit } from 'lucide-react';

/**
 * Compact transaction ledger item.
 * @component TransactionCard
 */
export const TransactionCard = ({
  transaction,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  const { displayCurrency } = useCurrency();
  const { _id, type, amount, originalAmount, originalCurrency, convertedAmount, category, title, description, date } = transaction;

  const targetCurrency = displayCurrency || user?.preferredCurrency || user?.currency || 'USD';
  const showConvertedAmount = convertedAmount !== undefined ? convertedAmount : amount;
  const showOriginalAmount = originalAmount !== undefined ? originalAmount : amount;
  const showOriginalCurrency = (originalCurrency || user?.preferredCurrency || user?.currency || 'USD').toUpperCase();

  const isIncome = type === 'income';

  return (
    <div className="glass-card p-4 flex items-center justify-between gap-4 relative group">
      {/* Category Icon Badge */}
      <div className="flex items-center gap-3.5 min-w-0">
        <CategoryIconBadge category={category} size="md" />
        <div className="text-left min-w-0">
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate tracking-wide leading-snug">
            {title}
          </h4>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 max-w-[200px] sm:max-w-md">
              {description}
            </p>
          )}
          <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 font-semibold tracking-wider mt-1 uppercase">
            <Calendar className="w-3 h-3" />
            <span>{new Date(date).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Right details: Amount and actions */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right leading-tight">
          <span className={`text-base font-extrabold tracking-tight block ${isIncome ? 'text-success' : 'text-danger'}`}>
            {isIncome ? '+' : '-'}{formatAmount(showConvertedAmount, targetCurrency)}
          </span>
          {showOriginalCurrency !== targetCurrency && (
            <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 leading-none mt-0.5">
              {isIncome ? '+' : '-'}{formatAmount(showOriginalAmount, showOriginalCurrency)} {showOriginalCurrency}
            </span>
          )}
          <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase mt-1">
            {category}
          </span>
        </div>

        {/* Hover Action controls */}
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute right-4 md:relative md:right-0 bg-white/90 dark:bg-darkBg-card/90 md:bg-transparent dark:md:bg-transparent rounded-xl shadow-lg md:shadow-none p-1 md:p-0 border border-gray-100 dark:border-gray-800 md:border-none z-10">
            {onEdit && (
              <button
                onClick={() => onEdit(transaction)}
                className="text-gray-500 hover:text-primary p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Edit Transaction"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(_id)}
                className="text-gray-500 hover:text-danger p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Delete Transaction"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionCard;
