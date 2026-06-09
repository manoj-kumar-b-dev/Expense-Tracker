/**
 * @file Budget.js
 * @description Mongoose database model for Budgets.
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

const BudgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Budget must belong to a user'],
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: {
      values: CATEGORIES,
      message: `{VALUE} is not a valid category. Valid options: ${CATEGORIES.join(', ')}`,
    },
  },
  monthlyLimit: {
    type: Number,
    required: [true, 'Please add a monthly limit'],
    min: [0, 'Limit cannot be negative'],
  },
  month: {
    type: Number,
    required: [true, 'Please specify the month (1-12)'],
    min: [1, 'Month must be between 1 and 12'],
    max: [12, 'Month must be between 1 and 12'],
  },
  year: {
    type: Number,
    required: [true, 'Please specify the year'],
    min: [2000, 'Year must be valid'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Enforce unique budget per user, category, month, and year
BudgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
