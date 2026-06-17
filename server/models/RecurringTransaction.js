/**
 * @file RecurringTransaction.js
 * @description Mongoose schema for recurring transaction rules. Each document represents
 * a user-defined repeating financial event (e.g., rent, salary, subscriptions).
 * A daily cron job reads active rules and auto-inserts Transaction records.
 */

const mongoose = require('mongoose');

const VALID_FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'];
const VALID_CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Entertainment',
  'Bills', 'Healthcare', 'Education', 'Salary', 'Freelance', 'Other'
];
const VALID_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'];

const RecurringTransactionSchema = new mongoose.Schema({
  // Owner reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recurring transaction must belong to a user'],
    index: true,
  },

  // Core transaction fields (mirrors Transaction model)
  title: {
    type: String,
    required: [true, 'Please provide a title for this recurring transaction'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  amount: {
    type: Number,
    required: [true, 'Please add a valid amount'],
    min: [0.01, 'Amount must be greater than zero'],
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: {
      values: ['income', 'expense'],
      message: 'Type must be either income or expense',
    },
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: {
      values: VALID_CATEGORIES,
      message: `{VALUE} is not a valid category`,
    },
  },

  // Scheduling fields
  frequency: {
    type: String,
    required: [true, 'Please specify a recurrence frequency'],
    enum: {
      values: VALID_FREQUENCIES,
      message: `Frequency must be one of: ${VALID_FREQUENCIES.join(', ')}`,
    },
  },
  startDate: {
    type: Date,
    required: [true, 'Please specify a start date'],
  },
  endDate: {
    type: Date,
    default: null, // null means indefinite — no end date
  },
  nextExecutionDate: {
    type: Date,
    required: true,
  },
  lastExecutedDate: {
    type: Date,
    default: null,
  },

  // Control flags
  isActive: {
    type: Boolean,
    default: true,
  },

  // Optional metadata
  notes: {
    type: String,
    trim: true,
    maxlength: [250, 'Notes cannot exceed 250 characters'],
    default: '',
  },
  paymentMethod: {
    type: String,
    trim: true,
    default: '',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ── Indexes ───────────────────────────────────────────────────────────────────
// Primary cron query index: find active rules due today, scoped per user
RecurringTransactionSchema.index(
  { userId: 1, isActive: 1, nextExecutionDate: 1 },
  { name: 'cron_query_idx' }
);

// User-facing listing index: sorted by creation date
RecurringTransactionSchema.index(
  { userId: 1, createdAt: -1 },
  { name: 'user_list_idx' }
);

module.exports = mongoose.model('RecurringTransaction', RecurringTransactionSchema);
