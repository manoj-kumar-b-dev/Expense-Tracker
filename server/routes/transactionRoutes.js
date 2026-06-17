/**
 * @file transactionRoutes.js
 * @description Transaction routes configuration with route parameter validations.
 */

const express = require('express');
const { body } = require('express-validator');
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { validateResult } = require('../middleware/validateMiddleware');

const router = express.Router();

const transactionValidation = [
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be either income or expense'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number greater than 0'),
  body('category')
    .notEmpty()
    .withMessage('Category selection is required')
    .trim(),
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 250 })
    .withMessage('Description cannot exceed 250 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  validateResult,
];

// All routes here require JWT Auth
router.use(protect);

router.route('/')
  .get(getTransactions)
  .post(transactionValidation, createTransaction);

router.route('/:id')
  .put(transactionValidation, updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
