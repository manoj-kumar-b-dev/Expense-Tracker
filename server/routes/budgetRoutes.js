/**
 * @file budgetRoutes.js
 * @description Budget route controls and constraints.
 */

const express = require('express');
const { body } = require('express-validator');
const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetStatus
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');
const { validateResult } = require('../middleware/validateMiddleware');

const router = express.Router();

const budgetValidation = [
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .trim(),
  body('monthlyLimit')
    .isFloat({ min: 0 })
    .withMessage('Monthly limit cannot be negative'),
  body('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be an integer between 1 and 12'),
  body('year')
    .isInt({ min: 2000 })
    .withMessage('Year must be valid starting from 2000'),
  validateResult,
];

const budgetUpdateValidation = [
  body('monthlyLimit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly limit cannot be negative'),
  body('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  body('year')
    .optional()
    .isInt({ min: 2000 })
    .withMessage('Year must be valid'),
  validateResult,
];

// All routes require Auth
router.use(protect);

router.get('/status', getBudgetStatus);

router.route('/')
  .get(getBudgets)
  .post(budgetValidation, createBudget);

router.route('/:id')
  .put(budgetUpdateValidation, updateBudget)
  .delete(deleteBudget);

module.exports = router;
