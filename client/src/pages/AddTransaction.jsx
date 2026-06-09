/**
 * @file AddTransaction.jsx
 * @description Guided multi-stage Wizard form to add new transaction records.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { getCategoryMeta } from '../utils/categoryIcons';
import { formatCurrency } from '../utils/formatCurrency';
import { useAuth } from '../context/AuthContext';
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
  DollarSign
} from 'lucide-react';

export const AddTransaction = () => {
  const navigate = useNavigate();
  const { addTransaction } = useTransactions();
  const { user } = useAuth();
  const activeCurrency = user?.currency || 'USD';

  // 1. Wizard Stage state
  const [step, setStep] = useState(1);

  // 2. Transaction form fields state
  const [type, setType] = useState('expense'); // 'income' | 'expense'
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

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
      await addTransaction({
        type,
        category,
        amount: parseFloat(amount),
        title,
        description,
        date
      });
      navigate('/dashboard');
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
              <Input
                label="Amount"
                type="number"
                step="0.01"
                icon={DollarSign}
                placeholder="0.00"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setFormError(''); }}
              />

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
          </div>
        )}

        {/* STEP 4: Summary & Confirm */}
        {step === 4 && (
          <div className="space-y-6 py-2 animate-fadeIn">
            <h3 className="text-base font-extrabold text-gray-850 dark:text-white text-center leading-none">
              Confirm Transaction Summary
            </h3>
            
            <div className="glass-card p-6 border border-gray-200/50 dark:border-gray-800/40 relative overflow-hidden text-left max-w-md mx-auto">
              {/* Type accent badge */}
              <div className={`absolute top-0 right-0 px-4 py-1 text-[10px] font-black uppercase tracking-wider rounded-bl-xl ${type === 'income' ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                {type}
              </div>

              <div className="space-y-4">
                <div className="text-left">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Title</span>
                  <span className="text-base font-extrabold text-gray-900 dark:text-white">{title}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Amount</span>
                    <span className={`text-lg font-black tracking-tight ${type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {type === 'income' ? '+' : '-'}{formatCurrency(amount, activeCurrency)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Category</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{category}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Date</span>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{new Date(date).toLocaleDateString()}</span>
                  </div>
                  {description && (
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
              variant="success"
              onClick={handleSubmitTransaction}
              isLoading={loading}
            >
              <Check className="w-4 h-4 shrink-0" />
              <span>Register Transaction</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddTransaction;
