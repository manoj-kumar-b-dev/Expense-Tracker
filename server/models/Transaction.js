/**
 * @file Transaction.js
 * @description Mongoose database model for Transactions.
 */

const mongoose = require('mongoose');

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

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Transaction must belong to a user'],
  },
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: {
      values: ['income', 'expense'],
      message: 'Type must be either income or expense',
    },
  },
  amount: {
    type: Number,
    required: [true, 'Please add a positive amount'],
    min: [0.01, 'Amount must be greater than zero'],
  },
  originalAmount: {
    type: Number,
  },
  originalCurrency: {
    type: String,
    uppercase: true,
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: {
      values: CATEGORIES,
      message: `{VALUE} is not a valid category. Valid options: ${CATEGORIES.join(', ')}`,
    },
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [250, 'Description cannot exceed 250 characters'],
    default: '',
  },
  // Optional: links auto-generated transactions back to their recurring rule.
  // Null for all manually created transactions (fully backward-compatible).
  recurringId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecurringTransaction',
    default: null,
  },
  date: {
    type: Date,
    required: [true, 'Please specify a transaction date'],
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to speed up filtering, sorting, and analytics queries for a specific user
TransactionSchema.index({ userId: 1, date: -1, category: 1, type: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
