/**
 * @file RecurringFormModal.jsx
 * @description Modal form for creating or editing a recurring transaction rule.
 * Used by RecurringManager page and the AddTransaction wizard.
 */

import React, { useState, useEffect } from 'react';
import { X, Repeat2, Calendar, DollarSign, Tag, FileText } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

const CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Entertainment',
  'Bills', 'Healthcare', 'Education', 'Salary', 'Freelance', 'Other',
];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'];
const FREQUENCIES = [
  { value: 'daily',   label: 'Daily',   hint: 'Every day' },
  { value: 'weekly',  label: 'Weekly',  hint: 'Every 7 days' },
  { value: 'monthly', label: 'Monthly', hint: 'Same date each month' },
  { value: 'yearly',  label: 'Yearly',  hint: 'Same date each year' },
];

const todayStr = () => new Date().toISOString().split('T')[0];

/**
 * @component RecurringFormModal
 * @param {boolean}  isOpen       - Controls modal visibility
 * @param {Function} onClose      - Callback to close the modal
 * @param {Function} onSubmit     - Callback with form data on submit
 * @param {Object}   [editData]   - Existing rule data when editing (null = create mode)
 * @param {boolean}  [isLoading]  - Shows spinner on submit button
 * @param {string}   [defaultCurrency] - User's preferred currency
 */
export const RecurringFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editData = null,
  isLoading = false,
  defaultCurrency = 'USD',
}) => {
  const isEditing = Boolean(editData);

  const [form, setForm] = useState({
    title: '',
    amount: '',
    currency: defaultCurrency,
    type: 'expense',
    category: 'Bills',
    frequency: 'monthly',
    startDate: todayStr(),
    endDate: '',
    noEndDate: true,
    notes: '',
    paymentMethod: '',
  });
  const [formError, setFormError] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || '',
        amount: editData.amount?.toString() || '',
        currency: editData.currency || defaultCurrency,
        type: editData.type || 'expense',
        category: editData.category || 'Bills',
        frequency: editData.frequency || 'monthly',
        startDate: editData.startDate
          ? new Date(editData.startDate).toISOString().split('T')[0]
          : todayStr(),
        endDate: editData.endDate
          ? new Date(editData.endDate).toISOString().split('T')[0]
          : '',
        noEndDate: !editData.endDate,
        notes: editData.notes || '',
        paymentMethod: editData.paymentMethod || '',
      });
    } else {
      setForm({
        title: '',
        amount: '',
        currency: defaultCurrency,
        type: 'expense',
        category: 'Bills',
        frequency: 'monthly',
        startDate: todayStr(),
        endDate: '',
        noEndDate: true,
        notes: '',
        paymentMethod: '',
      });
    }
    setFormError('');
  }, [editData, isOpen, defaultCurrency]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    if (!form.title.trim()) return 'Title is required.';
    if (!form.amount || parseFloat(form.amount) <= 0) return 'Please enter a valid amount greater than 0.';
    if (!form.startDate) return 'Please select a start date.';
    if (!form.noEndDate && form.endDate && form.endDate < form.startDate) {
      return 'End date must be after the start date.';
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validate();
    if (error) { setFormError(error); return; }
    setFormError('');

    onSubmit({
      title: form.title.trim(),
      amount: parseFloat(form.amount),
      currency: form.currency,
      type: form.type,
      category: form.category,
      frequency: form.frequency,
      startDate: form.startDate,
      endDate: form.noEndDate ? null : (form.endDate || null),
      notes: form.notes,
      paymentMethod: form.paymentMethod,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" />

      {/* Modal Panel */}
      <div className="glass-modal relative w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 md:p-8 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Repeat2 className="w-5 h-5 text-primary dark:text-primary-light" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Recurring Rule' : 'New Recurring Rule'}
              </h2>
              <p className="text-[11px] font-semibold text-gray-400">
                {isEditing ? 'Update the details below' : 'Set up an automatic repeating transaction'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {formError && (
          <div className="mb-4 bg-danger/10 border border-danger/20 text-danger p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span> {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-3">
            {['expense', 'income'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set('type', t)}
                className={`py-2.5 px-4 rounded-xl text-sm font-bold border transition-all duration-200 ${
                  form.type === t
                    ? t === 'expense'
                      ? 'bg-danger/10 border-danger/40 text-danger ring-1 ring-danger/20'
                      : 'bg-success/10 border-success/40 text-success ring-1 ring-success/20'
                    : 'border-gray-200/50 dark:border-gray-800/50 text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                {t === 'expense' ? '↓ Expense' : '↑ Income'}
              </button>
            ))}
          </div>

          {/* Title */}
          <Input
            label="Transaction Title"
            type="text"
            icon={Tag}
            placeholder="E.g., Netflix Subscription, Monthly Rent..."
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
          />

          {/* Amount + Currency Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => set('currency', e.target.value)}
                className="glass-input text-xs h-[46px] bg-white dark:bg-darkBg-card dark:text-white"
              >
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <Input
                label="Amount"
                type="number"
                step="0.01"
                min="0.01"
                icon={DollarSign}
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase">Category</label>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className="glass-input text-sm bg-white dark:bg-darkBg-card dark:text-white"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Frequency */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase">Frequency</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FREQUENCIES.map(({ value, label, hint }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set('frequency', value)}
                  title={hint}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all duration-200 ${
                    form.frequency === value
                      ? 'bg-primary/10 border-primary/40 text-primary dark:text-primary-light ring-1 ring-primary/20'
                      : 'border-gray-200/50 dark:border-gray-800/50 text-gray-500 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Start Date + End Date Row */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              icon={Calendar}
              value={form.startDate}
              onChange={(e) => set('startDate', e.target.value)}
            />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase">End Date</label>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors">
                  <input
                    type="checkbox"
                    checked={form.noEndDate}
                    onChange={(e) => set('noEndDate', e.target.checked)}
                    className="w-3.5 h-3.5 accent-primary cursor-pointer"
                  />
                  No end date
                </label>
              </div>
              <input
                type="date"
                value={form.endDate}
                min={form.startDate}
                disabled={form.noEndDate}
                onChange={(e) => set('endDate', e.target.value)}
                className={`glass-input text-sm h-[46px] bg-white dark:bg-darkBg-card dark:text-white transition-opacity ${
                  form.noEndDate ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>

          {/* Notes (optional) */}
          <Input
            label="Notes (Optional)"
            type="text"
            icon={FileText}
            placeholder="Any extra context or comments..."
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
          />

          {/* Submit Row */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200/40 dark:border-gray-800/40">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              <Repeat2 className="w-4 h-4 shrink-0" />
              <span>{isEditing ? 'Save Changes' : 'Create Rule'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecurringFormModal;
