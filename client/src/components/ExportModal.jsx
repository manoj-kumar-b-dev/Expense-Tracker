/**
 * @file ExportModal.jsx
 * @description Premium Modal interface to customize filters, preview matching volumes, and trigger PDF/Excel/CSV downloads.
 */

import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useExport } from '../hooks/useExport';
import { formatAmount } from '../utils/formatCurrency';
import api from '../api/axiosInstance';
import { Check, Calendar, AlertCircle, RefreshCw } from 'lucide-react';

const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills',
  'Healthcare',
  'Education',
  'Salary',
  'Freelance',
  'Other'
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'];

export const ExportModal = ({ isOpen, onClose, initialFormat = 'pdf', initialFilters = {} }) => {
  const { exportPDF, exportExcel, exportCSV, isExporting } = useExport();

  // 1. Filter States
  const [startDate, setStartDate] = useState(initialFilters.startDate || '');
  const [endDate, setEndDate] = useState(initialFilters.endDate || '');
  const [type, setType] = useState(initialFilters.type || 'all');
  const [selectedCategories, setSelectedCategories] = useState(
    initialFilters.category ? initialFilters.category.split(',') : CATEGORIES
  );
  const [exportCurrency, setExportCurrency] = useState(initialFilters.currency || 'USD');
  const [format, setFormat] = useState(initialFormat);

  // 2. Live Preview States
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewStats, setPreviewStats] = useState({ total: 0, income: 0, expense: 0, balance: 0 });
  const [previewError, setPreviewError] = useState('');

  // 3. Category Select Helper Functions
  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const selectAllCategories = () => {
    setSelectedCategories(CATEGORIES);
  };

  const deselectAllCategories = () => {
    setSelectedCategories([]);
  };

  // Sync initial filters when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialFilters.startDate) setStartDate(initialFilters.startDate);
      if (initialFilters.endDate) setEndDate(initialFilters.endDate);
      if (initialFilters.type) setType(initialFilters.type);
      if (initialFilters.category) {
        setSelectedCategories(initialFilters.category.split(','));
      } else {
        setSelectedCategories(CATEGORIES);
      }
      if (initialFilters.currency) setExportCurrency(initialFilters.currency);
      setFormat(initialFormat);
    }
  }, [isOpen, initialFilters, initialFormat]);

  // 4. Fetch Live Preview statistics
  useEffect(() => {
    if (!isOpen) return;

    const fetchPreview = async () => {
      setPreviewLoading(true);
      setPreviewError('');
      try {
        const params = {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          type: type !== 'all' ? type : undefined,
          category: selectedCategories.length > 0 ? selectedCategories.join(',') : 'None',
          displayCurrency: exportCurrency,
          limit: 1 // We only need totals and stats, pagination limit of 1 speeds up DB queries
        };

        const res = await api.get('/transactions', { params });
        const { pagination, stats } = res.data;
        
        setPreviewStats({
          total: pagination.total || 0,
          income: stats.income || 0,
          expense: stats.expense || 0,
          balance: stats.balance || 0
        });
      } catch (err) {
        console.error('Failed to load export preview statistics:', err);
        setPreviewError('Failed to load transaction summary. Please check filters.');
      } finally {
        setPreviewLoading(false);
      }
    };

    // Debounce preview query slightly
    const delayDebounce = setTimeout(() => {
      fetchPreview();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [isOpen, startDate, endDate, type, selectedCategories, exportCurrency]);

  // 5. Download Trigger Function
  const handleDownload = async () => {
    const params = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      type: type !== 'all' ? type : undefined,
      category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
      currency: exportCurrency
    };

    if (format === 'pdf') {
      await exportPDF(params);
    } else if (format === 'excel') {
      await exportExcel(params);
    } else {
      await exportCSV(params);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Export Options" size="lg">
      <div className="space-y-6 text-left">
        
        {/* Format Selector Tab */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
            Export Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'pdf', label: '📄 PDF Report' },
              { id: 'excel', label: '📊 Excel Sheet' },
              { id: 'csv', label: '📋 CSV Spreadsheet' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFormat(f.id)}
                className={`py-3 px-4 rounded-xl text-xs font-extrabold border transition-all duration-200 ${
                  format === f.id
                    ? 'bg-primary/10 border-primary text-primary dark:text-primary-light'
                    : 'bg-white/40 dark:bg-darkBg-card/30 border-gray-200/50 dark:border-gray-800/40 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Ranges and Type Rows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="glass-input pl-10 text-xs w-full h-[46px] dark:bg-darkBg-card dark:text-white"
              />
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
              End Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="glass-input pl-10 text-xs w-full h-[46px] dark:bg-darkBg-card dark:text-white"
              />
            </div>
          </div>

          {/* Type Select */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
              Transaction Type
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="glass-input text-xs w-full h-[46px] bg-white dark:bg-[#161C2A] dark:text-white"
            >
              <option value="all">All Transactions</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>
          </div>
        </div>

        {/* Category Multi Select */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
              Filter Categories ({selectedCategories.length} selected)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllCategories}
                className="text-[10px] font-extrabold text-primary hover:underline"
              >
                Select All
              </button>
              <span className="text-gray-300 dark:text-gray-800">|</span>
              <button
                type="button"
                onClick={deselectAllCategories}
                className="text-[10px] font-extrabold text-danger hover:underline"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-white/40 dark:bg-darkBg-card/30 border border-gray-200/50 dark:border-gray-800/40">
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isSelected
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Export Currency Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
            Conversion Currency
          </label>
          <div className="grid grid-cols-7 gap-2">
            {CURRENCIES.map(curr => (
              <button
                key={curr}
                type="button"
                onClick={() => setExportCurrency(curr)}
                className={`py-2 rounded-xl text-xs font-extrabold border transition-all duration-200 ${
                  exportCurrency === curr
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-white/40 dark:bg-[#161C2A]/30 border-gray-200/50 dark:border-gray-800/40 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
          <p className="text-[10px] font-semibold text-gray-400 mt-1">
            * All transaction records will be dynamically converted to this currency based on cached exchange rates.
          </p>
        </div>

        {/* Live Preview Panel */}
        <div className="rounded-2xl p-4 bg-gray-50 dark:bg-darkBg-card/50 border border-gray-200/50 dark:border-gray-850/30">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center justify-between">
            <span>Live Export Preview</span>
            {previewLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />}
          </h4>

          {previewLoading ? (
            <div className="space-y-2 py-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-1/2" />
            </div>
          ) : previewError ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-danger">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{previewError}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Transactions Count */}
              <div className="text-left">
                <span className="block text-[10px] font-bold text-gray-400 uppercase">Transactions Count</span>
                <span className="text-lg font-extrabold text-gray-800 dark:text-white">
                  {previewStats.total} matches
                </span>
              </div>

              {/* Total Income Preview */}
              {(type === 'all' || type === 'income') && (
                <div className="text-left">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Total Income</span>
                  <span className="text-lg font-extrabold text-success">
                    {formatAmount(previewStats.income, exportCurrency)}
                  </span>
                </div>
              )}

              {/* Total Expense Preview */}
              {(type === 'all' || type === 'expense') && (
                <div className="text-left">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Total Expenses</span>
                  <span className="text-lg font-extrabold text-danger">
                    {formatAmount(previewStats.expense, exportCurrency)}
                  </span>
                </div>
              )}

              {/* Net Balance Preview */}
              {type === 'all' && (
                <div className="text-left">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Net Balance</span>
                  <span className={`text-lg font-extrabold ${previewStats.balance >= 0 ? 'text-primary dark:text-primary-light' : 'text-danger'}`}>
                    {formatAmount(previewStats.balance, exportCurrency)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions Row */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-800/40">
          <Button type="button" variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            type="button"
            isLoading={isExporting}
            disabled={previewStats.total === 0 || previewLoading}
            onClick={handleDownload}
            className="px-6"
          >
            Download {format.toUpperCase()}
          </Button>
        </div>

      </div>
    </Modal>
  );
};

export default ExportModal;
