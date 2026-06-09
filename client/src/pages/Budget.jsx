/**
 * @file Budget.jsx
 * @description Monthly budgets control panel displaying live category progression scales, configure modals, and custom exceeded warnings.
 */

import React, { useEffect, useState } from 'react';
import { useBudgets } from '../hooks/useBudgets';
import { BudgetCard } from '../components/cards/BudgetCard';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useForm } from 'react-hook-form';
import { SkeletonCard } from '../components/ui/Skeleton';
import { PiggyBank, PlusCircle, Calendar, ShieldCheck, X } from 'lucide-react';

export const Budget = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const {
    budgetStatus,
    loading,
    fetchBudgetStatus,
    addBudget,
    editBudget,
    removeBudget
  } = useBudgets();

  // 1. Modal toggle states
  const [isOpen, setIsOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  // 2. React hook form setup
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      category: 'Food',
      monthlyLimit: '',
      month: selectedMonth,
      year: selectedYear,
    }
  });

  const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Salary', 'Freelance', 'Other'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Fetch status whenever dates filter change
  useEffect(() => {
    fetchBudgetStatus({ month: selectedMonth, year: selectedYear });
  }, [selectedMonth, selectedYear, fetchBudgetStatus]);

  // Handle open creation modal
  const handleOpenCreate = () => {
    setEditingBudget(null);
    reset({
      category: 'Food',
      monthlyLimit: '',
      month: selectedMonth,
      year: selectedYear,
    });
    setIsOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (statusItem) => {
    setEditingBudget(statusItem);
    setValue('category', statusItem.category);
    setValue('monthlyLimit', statusItem.monthlyLimit);
    setValue('month', statusItem.month);
    setValue('year', statusItem.year);
    setIsOpen(true);
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      if (editingBudget && editingBudget._id) {
        await editBudget(editingBudget._id, {
          monthlyLimit: parseFloat(data.monthlyLimit),
          month: parseInt(data.month),
          year: parseInt(data.year),
        });
      } else {
        await addBudget({
          category: data.category,
          monthlyLimit: parseFloat(data.monthlyLimit),
          month: parseInt(data.month),
          year: parseInt(data.year),
        });
      }
      setIsOpen(false);
      // Refresh status tracker
      fetchBudgetStatus({ month: selectedMonth, year: selectedYear });
    } catch (err) {
      console.error(err);
    }
  };

  // Handle deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this budget target limit?')) {
      try {
        await removeBudget(id);
        fetchBudgetStatus({ month: selectedMonth, year: selectedYear });
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn text-left">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left">
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Monthly Budget Center
          </h2>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Define categorical limit thresholds, track spending caps, and prevent overspending.
          </p>
        </div>

        {/* Configure button */}
        <Button onClick={handleOpenCreate}>
          <PlusCircle className="w-4 h-4 shrink-0" />
          <span>Configure Budget</span>
        </Button>
      </div>

      {/* Date selector toolbar */}
      <div className="glass-panel p-5 flex flex-col sm:flex-row gap-4 items-center justify-between border border-gray-200/50 dark:border-gray-800/40">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
            Viewing budgets for:
          </span>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          {/* Month selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="glass-input text-xs h-10 px-3 w-full bg-white dark:bg-darkBg-card dark:text-white"
          >
            {months.map((m, idx) => (
              <option key={m} value={idx + 1}>{m}</option>
            ))}
          </select>

          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="glass-input text-xs h-10 px-3 w-full bg-white dark:bg-darkBg-card dark:text-white"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Budgets Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : budgetStatus.length === 0 ? (
        <div className="glass-panel p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-primary/10 text-primary rounded-full">
            <PiggyBank className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">No Budgets Programmed</h3>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 max-w-sm">
            Set custom limits for categories like Food, Transport, and Shopping to track spend progression.
          </p>
          <Button onClick={handleOpenCreate} size="sm">
            Configure First Budget
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetStatus.map((item, idx) => (
            <BudgetCard
              key={idx}
              budgetStatusItem={item}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Configure/Edit Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingBudget ? 'Adjust Budget Limit' : 'Configure New Budget Limit'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          {/* Category selection */}
          <div className="space-y-1.5 w-full">
            <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Spend Category
            </label>
            <select
              className="glass-input text-xs w-full h-[46px] bg-white dark:bg-darkBg-card dark:text-white disabled:opacity-50 disabled:pointer-events-none"
              disabled={!!editingBudget}
              {...register('category')}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Monthly limit */}
          <Input
            label="Monthly Limit ($)"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.monthlyLimit?.message}
            {...register('monthlyLimit', {
              required: 'Limit target is required',
              min: { value: 0.01, message: 'Limit must be greater than zero' }
            })}
          />

          {/* Month / Year selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 w-full">
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Target Month
              </label>
              <select
                className="glass-input text-xs w-full h-[46px] bg-white dark:bg-darkBg-card dark:text-white"
                {...register('month')}
              >
                {months.map((m, idx) => (
                  <option key={m} value={idx + 1}>{m}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 w-full">
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Target Year
              </label>
              <select
                className="glass-input text-xs w-full h-[46px] bg-white dark:bg-darkBg-card dark:text-white"
                {...register('year')}
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-5 border-t border-gray-200/50 dark:border-gray-800/40">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingBudget ? 'Adjust Target' : 'Register Limit'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Budget;
