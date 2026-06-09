/**
 * @file authRoutes.js
 * @description Authentication endpoint routing table with input request validation guards.
 */

const express = require('express');
const { body } = require('express-validator');
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateResult } = require('../middleware/validateMiddleware');

const router = express.Router();

// Input schemas validation
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Please include a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validateResult,
];

const loginValidation = [
  body('email').isEmail().withMessage('Please include a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validateResult,
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
