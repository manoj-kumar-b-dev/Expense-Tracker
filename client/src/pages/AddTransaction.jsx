/**
 * @file AddTransaction.jsx
 * @description Guided multi-stage Wizard form to add new transaction records.
 * Supports optional "Make this recurring" mode that creates a RecurringTransaction rule
 * instead of a one-off Transaction document.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { useRecurring } from '../hooks/useRecurring';
import { getCategoryMeta } from '../utils/categoryIcons';
import { formatAmount } from '../utils/formatCurrency';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../hooks/useCurrency';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  TrendingUp,
  TrendingDown,
  Calendar,
  Tag,
  DollarSign,
  Repeat2
} from 'lucide-react';

export const AddTransaction = () => {
  const navigate = useNavigate();
  const { addTransaction } = useTransactions();
  const { createRule } = useRecurring();
  const { user } = useAuth();
  const activeCurrency = user?.currency || 'USD';

  // 1. Wizard Stage state
  const [step, setStep] = useState(1);

  // 2. Transaction form fields state
  const [type, setType] = useState('expense'); // 'income' | 'expense'
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // 3. Recurring mode state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');
  const [recurringEndDate, setRecurringEndDate] = useState('');
  const [noEndDate, setNoEndDate] = useState(true);

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const { convert } = useCurrency();

  useEffect(() => {
    if (user) {
      setCurrency(user.preferredCurrency || user.currency || 'USD');
    }
  }, [user]);

  const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Salary', 'Freelance', 'Other'];

  // Handle advancing to next wizard step
  const handleNextStep = () => {
    if (step === 1 && !type) return;
    if (step === 2 && !category) {
      setFormError('Please select a category to continue.');
      return;
    }
    if (step === 3) {
      if (!amount || parseFloat(amount) <= 0) {
        setFormError('Please add a valid amount greater than 0.');
        return;
      }
      if (!title.trim()) {
        setFormError('Transaction title is required.');
        return;
      }
      if (!date) {
        setFormError('Please select a transaction date.');
        return;
      }
    }

    setFormError('');
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setFormError('');
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmitTransaction = async () => {
    setLoading(true);
    setFormError('');
    try {
      if (isRecurring) {
        // Route to recurring rule creation
        await createRule({
          type,
          category,
          amount: parseFloat(amount),
          currency,
          title,
          notes: description,
          frequency: recurringFrequency,
          startDate: date,
          endDate: noEndDate ? null : (recurringEndDate || null),
        });
        navigate('/recurring');
      } else {
        // Standard one-off transaction
        await addTransaction({
          type,
          category,
          amount: parseFloat(amount),
          originalAmount: parseFloat(amount),
          originalCurrency: currency,
          title,
          description,
          date
        });
        navigate('/dashboard');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 md:space-y-8 animate-fadeIn text-left">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Create New Transaction
        </h2>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          Complete the steps to register a new income or expense transaction.
        </p>
      </div>

      {/* Progress indicators */}
      <div className="grid grid-cols-4 gap-2 pb-4">
        {[
          { label: 'Type', idx: 1 },
          { label: 'Category', idx: 2 },
          { label: 'Details', idx: 3 },
          { label: 'Confirm', idx: 4 }
        ].map((item) => (
          <div key={item.idx} className="space-y-2">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= item.idx ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-800'}`} />
            <span className={`block text-[10px] font-bold uppercase tracking-wider text-center ${step === item.idx ? 'text-primary' : 'text-gray-400'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Step Container panels with glassmorphism */}
      <div className="glass-panel p-6 md:p-8 min-h-[320px] flex flex-col justify-between border border-gray-200/50 dark:border-gray-800/40 relative">
        {formError && (
          <div className="absolute top-4 left-4 right-4 bg-danger/10 border border-danger/20 text-danger p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span> {formError}
          </div>
        )}

        {/* STEP 1: Select Type */}
        {step === 1 && (
          <div className="space-y-6 py-4 animate-fadeIn">
            <h3 className="text-base font-extrabold text-gray-850 dark:text-white text-center">
              What type of transaction is this?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Expense card */}
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex flex-col items-center justify-center p-8 rounded-2xl border transition-all duration-200 ${type === 'expense'
                  ? 'border-danger/50 bg-danger/5 text-danger ring-2 ring-danger/20 scale-[1.02]'
                  : 'border-gray-200/50 dark:border-gray-800/50 bg-white/40 dark:bg-darkBg-card/40 text-gray-400 hover:border-danger/30 hover:bg-danger/[0.01]'
                }`}
              >
                <div className="p-4 bg-danger/10 text-danger rounded-full shadow-inner mb-4">
                  <TrendingDown className="w-8 h-8" />
                </div>
                <span className="text-base font-extrabold tracking-wide">Expense</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase mt-1">Cash Outflows</span>
              </button>

              {/* Income card */}
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex flex-col items-center justify-center p-8 rounded-2xl border transition-all duration-200 ${type === 'income'
                  ? 'border-success/50 bg-success/5 text-success ring-2 ring-success/20 scale-[1.02]'
                  : 'border-gray-200/50 dark:border-gray-800/50 bg-white/40 dark:bg-darkBg-card/40 text-gray-400 hover:border-success/30 hover:bg-success/[0.01]'
                }`}
              >
                <div className="p-4 bg-success/10 text-success rounded-full shadow-inner mb-4">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <span className="text-base font-extrabold tracking-wide">Income</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase mt-1">Cash Inflows</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Select Category */}
        {step === 2 && (
          <div className="space-y-6 py-2 animate-fadeIn">
            <h3 className="text-base font-extrabold text-gray-850 dark:text-white text-center leading-none">
              Choose a spending category
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto pr-1">
              {CATEGORIES.map((cat) => {
                const meta = getCategoryMeta(cat);
                const IconComp = meta.icon;
                const isSelected = category === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => { setCategory(cat); setFormError(''); }}
                    className={`flex flex-col items-center p-4 rounded-2xl border transition-all duration-200 ${isSelected
                      ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary scale-[1.02] font-black'
                      : 'border-gray-200/50 dark:border-gray-800/50 bg-white/40 dark:bg-[#161C2A]/30 text-gray-600 dark:text-gray-400 hover:border-primary/40 hover:bg-primary/[0.02]'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl border mb-2 ${meta.bg} ${meta.color} ${meta.border}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold tracking-wide">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Enter Details */}
        {step === 3 && (
          <div className="space-y-4 py-2 animate-fadeIn">
            <h3 className="text-base font-extrabold text-gray-850 dark:text-white text-center leading-none">
              Fill in transaction details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5 w-full col-span-1 text-left">
                  <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="glass-input text-xs w-full h-[46px] bg-white dark:bg-darkBg-card dark:text-white"
                  >
                    {['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'].map((curr) => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <Input
                    label="Amount"
                    type="number"
                    step="0.01"
                    icon={DollarSign}
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setFormError(''); }}
                  />
                  {amount && parseFloat(amount) > 0 && currency !== (user?.preferredCurrency || user?.currency || 'USD') && (
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">
                      ≈ {formatAmount(convert(parseFloat(amount), currency, user?.preferredCurrency || user?.currency || 'USD'), user?.preferredCurrency || user?.currency || 'USD')} {user?.preferredCurrency || user?.currency || 'USD'}
                    </p>
                  )}
                </div>
              </div>

              <Input
                label="Date"
                type="date"
                icon={Calendar}
                value={date}
                onChange={(e) => { setDate(e.target.value); setFormError(''); }}
              />
            </div>

            <Input
              label="Transaction Title"
              type="text"
              icon={Tag}
              placeholder="E.g., Groceries shopping, Freelance consulting..."
              value={title}
              onChange={(e) => { setTitle(e.target.value); setFormError(''); }}
            />

            <Input
              label="Description (Optional)"
              type="text"
              placeholder="Add extra context or comments..."
              value={description}
              onChange={(e) => { setDescription(e.target.value); setFormError(''); }}
            />

            {/* ── Recurring Toggle ── */}
            <div
              onClick={() => setIsRecurring((prev) => !prev)}
              className={`cursor-pointer flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                isRecurring
                  ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20'
                  : 'border-gray-200/50 dark:border-gray-800/50 bg-white/30 dark:bg-darkBg-card/20 hover:border-primary/20'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${isRecurring ? 'bg-primary/10 text-primary dark:text-primary-light' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                  <Repeat2 className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-extrabold text-gray-800 dark:text-gray-200">Make this recurring</span>
                  <span className="block text-[10px] font-semibold text-gray-400">Auto-insert on a schedule — daily, weekly, monthly, or yearly</span>
                </div>
              </div>
              <div className={`w-10 h-5.5 rounded-full flex items-center p-0.5 transition-colors shrink-0 ${
                isRecurring ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'
              }`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isRecurring ? 'translate-x-[18px]' : 'translate-x-0'
                }`} />
              </div>
            </div>

            {/* ── Recurring Options (shown when toggle is ON) ── */}
            {isRecurring && (
              <div className="space-y-3 p-4 rounded-xl border border-primary/20 bg-primary/[0.02] dark:bg-primary/5 animate-fadeIn">
                <p className="text-[11px] font-bold text-primary dark:text-primary-light uppercase tracking-wider">🔁 Recurring Configuration</p>

                {/* Frequency */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase">Frequency</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['daily', 'weekly', 'monthly', 'yearly'].map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setRecurringFrequency(freq)}
                        className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold capitalize transition-all duration-200 ${
                          recurringFrequency === freq
                            ? 'bg-primary/10 border-primary/40 text-primary dark:text-primary-light ring-1 ring-primary/20'
                            : 'border-gray-200/50 dark:border-gray-800/50 text-gray-400 hover:border-primary/20'
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>

                {/* End Date */}
                <div className="grid grid-cols-2 gap-3 items-end">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase">End Date</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-semibold text-gray-400">
                        <input
                          type="checkbox"
                          checked={noEndDate}
                          onChange={(e) => setNoEndDate(e.target.checked)}
                          className="w-3 h-3 accent-primary cursor-pointer"
                        />
                        No end
                      </label>
                    </div>
                    <input
                      type="date"
                      value={recurringEndDate}
                      min={date}
                      disabled={noEndDate}
                      onChange={(e) => setRecurringEndDate(e.target.value)}
                      className={`glass-input text-xs h-[38px] bg-white dark:bg-darkBg-card dark:text-white ${
                        noEndDate ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                  <div className="text-[10px] font-semibold text-gray-400 pb-1 leading-tight">
                    The date field above becomes the <span className="font-bold text-primary dark:text-primary-light">start date</span> for this rule
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Summary & Confirm */}
        {step === 4 && (
          <div className="space-y-6 py-2 animate-fadeIn">
            <h3 className="text-base font-extrabold text-gray-850 dark:text-white text-center leading-none">
              Confirm {isRecurring ? 'Recurring Rule' : 'Transaction'} Summary
            </h3>
            
            <div className="glass-card p-6 border border-gray-200/50 dark:border-gray-800/40 relative overflow-hidden text-left max-w-md mx-auto">
              {/* Type accent badge */}
              <div className={`absolute top-0 right-0 px-4 py-1 text-[10px] font-black uppercase tracking-wider rounded-bl-xl ${type === 'income' ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                {type}
              </div>

              {/* Recurring badge */}
              {isRecurring && (
                <div className="mb-3 flex items-center gap-1.5 text-xs font-bold text-primary dark:text-primary-light bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg w-fit">
                  <Repeat2 className="w-3.5 h-3.5" />
                  <span>Recurring · {recurringFrequency.charAt(0).toUpperCase() + recurringFrequency.slice(1)}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="text-left">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Title</span>
                  <span className="text-base font-extrabold text-gray-900 dark:text-white">{title}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Amount</span>
                    <span className={`text-lg font-black tracking-tight ${type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {type === 'income' ? '+' : '-'}{formatAmount(parseFloat(amount), currency)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Category</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{category}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {isRecurring ? 'Start Date' : 'Date'}
                    </span>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{new Date(date).toLocaleDateString()}</span>
                  </div>
                  {isRecurring && (
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Ends</span>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        {noEndDate ? 'No end date' : (recurringEndDate ? new Date(recurringEndDate).toLocaleDateString() : 'No end date')}
                      </span>
                    </div>
                  )}
                  {!isRecurring && description && (
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Description</span>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buttons navigation toolbar */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200/50 dark:border-gray-800/40 mt-6">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevStep}
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>Back</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              <span>Cancel</span>
            </Button>
          )}

          {step < 4 ? (
            <Button
              type="button"
              onClick={handleNextStep}
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Button>
          ) : (
            <Button
              type="button"
              variant={isRecurring ? 'primary' : 'success'}
              onClick={handleSubmitTransaction}
              isLoading={loading}
            >
              {isRecurring
                ? <Repeat2 className="w-4 h-4 shrink-0" />
                : <Check className="w-4 h-4 shrink-0" />}
              <span>{isRecurring ? 'Create Recurring Rule' : 'Register Transaction'}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddTransaction;
