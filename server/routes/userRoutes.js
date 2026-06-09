/**
 * @file userRoutes.js
 * @description User preferences and avatar routes.
 */

const express = require('express');
const { body } = require('express-validator');
const {
  updateUserProfile,
  uploadAvatar,
  deleteAccount
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { validateResult } = require('../middleware/validateMiddleware');

const router = express.Router();

const profileValidation = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please include a valid email')
    .normalizeEmail(),
  body('currency')
    .optional()
    .isString()
    .withMessage('Currency must be a string')
    .trim(),
  validateResult,
];

const avatarValidation = [
  body('avatar')
    .notEmpty()
    .withMessage('Base64 avatar string is required'),
  validateResult,
];

router.use(protect);

router.put('/profile', profileValidation, updateUserProfile);
router.post('/avatar', avatarValidation, uploadAvatar);
router.delete('/account', deleteAccount);

module.exports = router;
