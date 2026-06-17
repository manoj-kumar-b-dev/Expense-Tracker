/**
 * @file authRoutes.js
 * @description Authentication endpoint routing table with input request validation guards and rate limiting.
 */

const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { register, login, logout, getMe } = require('../controllers/authController');
const {
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
} = require('../controllers/passwordResetController');
const { protect } = require('../middleware/authMiddleware');
const { validateResult } = require('../middleware/validateMiddleware');

const router = express.Router();

// Rate limiter for forgot-password to mitigate email-bombing and brute-force (max 3 requests per hour per IP)
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 3, // limit each IP to 3 requests per windowMs
  message: {
    success: false,
    message: 'Too many password reset requests from this IP. Please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

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

const emailValidation = [
  body('email').isEmail().withMessage('Please include a valid email address').normalizeEmail(),
  validateResult,
];

const passwordValidation = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validateResult,
];

// Existing authentication routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

// Password recovery and verification routes
router.post('/forgot-password', forgotPasswordLimiter, emailValidation, forgotPassword);
router.put('/reset-password/:resetToken', passwordValidation, resetPassword);
router.get('/verify-email/:verificationToken', verifyEmail);
router.post('/resend-verification', emailValidation, resendVerification);

module.exports = router;

