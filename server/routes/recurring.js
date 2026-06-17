/**
 * @file recurring.js (routes)
 * @description Express router for recurring transaction rule endpoints.
 * All routes require JWT authentication via the `protect` middleware.
 *
 * Mounted at: /api/recurring
 */

const express = require('express');
const { body } = require('express-validator');
const {
  getAll,
  getUpcoming,
  create,
  update,
  remove,
  toggle,
  getHistory,
} = require('../controllers/recurringController');
const { protect } = require('../middleware/authMiddleware');
const { validateResult } = require('../middleware/validateMiddleware');

const router = express.Router();

// ── Validation Rules ──────────────────────────────────────────────────────────
const recurringValidation = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .trim()
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('amount')
    .isFloat({ min: 0.01 }).withMessage('Amount must be a positive number greater than 0'),
  body('type')
    .isIn(['income', 'expense']).withMessage('Type must be either income or expense'),
  body('category')
    .notEmpty().withMessage('Category is required').trim(),
  body('frequency')
    .isIn(['daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Frequency must be daily, weekly, monthly, or yearly'),
  body('startDate')
    .isISO8601().withMessage('Please provide a valid start date'),
  body('endDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('Please provide a valid end date'),
  validateResult,
];

// All routes require authentication
router.use(protect);

// ── Collection Routes ─────────────────────────────────────────────────────────
router.route('/')
  .get(getAll)
  .post(recurringValidation, create);

// NOTE: /upcoming must be declared BEFORE /:id to avoid Express treating
// "upcoming" as a dynamic :id parameter.
router.get('/upcoming', getUpcoming);

// ── Individual Rule Routes ────────────────────────────────────────────────────
router.route('/:id')
  .put(recurringValidation, update)
  .delete(remove);

router.patch('/:id/toggle', toggle);
router.get('/:id/history', getHistory);

module.exports = router;
