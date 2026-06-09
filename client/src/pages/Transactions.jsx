/**
 * @file Transactions.jsx
 * @description Transactions list manager supporting advanced queries filters, in-place edit modals, pagination, and streaming CSV downloads.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useDebounce } from '../hooks/useDebounce';
import { formatCurrency } from '../utils/formatCurrency';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { SkeletonTable } from '../components/ui/Skeleton';
import { CategoryIconBadge } from '../utils/categoryIcons';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Calendar,
  Edit,
  Trash2,
  X
} from 'lucide-react';

export const Transactions = () => {
  const { user } = useAuth();
  const activeCurrency = user?.currency || 'USD';

  const {
    transactions,
    loading,
    pagination,
    fetchTransactions,
    editTransaction,
    removeTransaction,
    exportCSV
  } = useTransactions();

  // 1. Query filters state parameters
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sort, setSort] = useState('date:desc');
  const [page, setPage] = useState(1);

  // Debounce search string input to avoid excess API requests
  const debouncedSearch = useDebounce(search, 400);

  // 2. Inline Action portals modals states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // 3. React hook forms for editing records
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm();

  // 4. Fetch records whenever states change
  useEffect(() => {
    fetchTransactions({
      page,
      limit: 10,
      search: debouncedSearch,
      type,
      category,
      startDate,
      endDate,
      sort
    });
  }, [page, debouncedSearch, type, category, startDate, endDate, sort, fetchTransactions]);

  // Categories list options
  const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Salary', 'Freelance', 'Other'];

  // Handle opening Edit Modal
  const handleOpenEdit = (transaction) => {
    setEditingItem(transaction);
    setValue('title', transaction.title);
    setValue('amount', transaction.amount);
    setValue('type', transaction.type);
    setValue('category', transaction.category);
    setValue('description', transaction.description || '');
    setValue('date', new Date(transaction.date).toISOString().split('T')[0]);
    setIsEditOpen(true);
  };

  const onEditSubmit = async (data) => {
    try {
      await editTransaction(editingItem._id, data);
      setIsEditOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle opening Delete Portal
  const handleOpenDelete = (id) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await removeTransaction(deletingId);
      setIsDeleteOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Reset Filters helper
  const clearFilters = () => {
    setSearch('');
    setType('');
    setCategory('');
    setStartDate('');
    setEndDate('');
    setSort('date:desc');
    setPage(1);
  };

  // CSV download click handler
  const handleCSVDownload = () => {
    exportCSV({
      search: debouncedSearch,
      type,
      category,
      startDate,
      endDate,
      sort
    });
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left">
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Transactions Ledger
          </h2>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Search, filter, paginate, export and manage all financial transactions in detail.
          </p>
        </div>

        {/* CSV export controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleCSVDownload}
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="glass-panel p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 border border-gray-200/50 dark:border-gray-800/40">
        {/* Searches input */}
        <div className="lg:col-span-2 relative text-left">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Search keyword
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search title, description..."
              className="glass-input pl-10 text-xs h-10 w-full"
            />
          </div>
        </div>

        {/* Type select */}
        <div className="text-left">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="glass-input text-xs h-10 w-full bg-white dark:bg-darkBg-card dark:text-gray-200"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {/* Category select */}
        <div className="text-left">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="glass-input text-xs h-10 w-full bg-white dark:bg-darkBg-card dark:text-gray-200"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Date Ranges */}
        <div className="text-left">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Date range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="glass-input text-[10px] px-2 h-10 w-full dark:bg-darkBg-card dark:text-gray-200"
              title="Start Date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="glass-input text-[10px] px-2 h-10 w-full dark:bg-darkBg-card dark:text-gray-200"
              title="End Date"
            />
          </div>
        </div>

        {/* Sorting index & resets */}
        <div className="text-left flex flex-col justify-end space-y-1 sm:space-y-0 sm:flex-row sm:items-end sm:gap-2">
          <div className="w-full">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 leading-none sm:mb-1">
              Sort by
            </label>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="glass-input text-xs h-10 w-full bg-white dark:bg-darkBg-card dark:text-gray-200"
            >
              <option value="date:desc">Newest Date</option>
              <option value="date:asc">Oldest Date</option>
              <option value="amount:desc">Highest Amount</option>
              <option value="amount:asc">Lowest Amount</option>
            </select>
          </div>
          <button
            onClick={clearFilters}
            className="h-10 px-3 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-danger rounded-xl flex items-center justify-center transition-colors shadow-inner"
            title="Reset Filters"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ledger list */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : transactions.length === 0 ? (
        <div className="glass-panel p-12 text-center flex flex-col items-center justify-center space-y-4">
          <span className="text-4xl animate-bounce">📂</span>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">No Transactions Found</h3>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 max-w-sm">
            We couldn't find any financial activities matching your parameters. Adjust filters or add a new record.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* List display */}
          <div className="space-y-3.5">
            {transactions.map((trans) => (
              <div key={trans._id} className="relative group">
                <div className="glass-card p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <CategoryIconBadge category={trans.category} size="md" />
                    <div className="text-left min-w-0">
                      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate tracking-wide leading-snug">
                        {trans.title}
                      </h4>
                      {trans.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 max-w-[200px] sm:max-w-md">
                          {trans.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 font-semibold tracking-wider mt-1 uppercase">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(trans.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right leading-none">
                      <span className={`text-base font-extrabold tracking-tight ${trans.type === 'income' ? 'text-success' : 'text-danger'}`}>
                        {trans.type === 'income' ? '+' : '-'}{formatCurrency(trans.amount, activeCurrency)}
                      </span>
                      <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase mt-1">
                        {trans.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute right-4 md:relative md:right-0 bg-white/95 dark:bg-darkBg-card/95 md:bg-transparent dark:md:bg-transparent rounded-xl shadow-lg md:shadow-none p-1 md:p-0 border border-gray-100 dark:border-gray-800 md:border-none z-10">
                      <button
                        onClick={() => handleOpenEdit(trans)}
                        className="text-gray-500 hover:text-primary p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(trans._id)}
                        className="text-gray-500 hover:text-danger p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination bar */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200/50 dark:border-gray-800/40 pt-5">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                >
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                  <span>Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pages))}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Transaction Record"
      >
        <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4 text-left">
          <Input
            label="Transaction Title"
            type="text"
            error={errors.title?.message}
            {...register('title', { required: 'Title is required' })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              error={errors.amount?.message}
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than zero' }
              })}
            />

            <div className="space-y-1.5 w-full">
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Type
              </label>
              <select
                className="glass-input text-xs w-full h-[46px] bg-white dark:bg-darkBg-card dark:text-white"
                {...register('type')}
              >
                <option value="income">Income (+)</option>
                <option value="expense">Expense (-)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 w-full">
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Category
              </label>
              <select
                className="glass-input text-xs w-full h-[46px] bg-white dark:bg-darkBg-card dark:text-white"
                {...register('category')}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <Input
              label="Transaction Date"
              type="date"
              error={errors.date?.message}
              {...register('date', { required: 'Date is required' })}
            />
          </div>

          <Input
            label="Description (Optional)"
            type="text"
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200/50 dark:border-gray-800/40">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Portal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Transaction Record"
      >
        <div className="space-y-6 text-left">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this transaction record? This action is permanent and cannot be undone.
          </p>
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200/50 dark:border-gray-800/40">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={confirmDelete}
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Transactions;
