/**
 * @file validateMiddleware.js
 * @description Helper middleware to evaluate express-validator input check outputs.
 */

const { validationResult } = require('express-validator');

/**
 * Validates request parameters and triggers a 400 response with detailed validation messages if checks fail.
 * @function validateResult
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Object|void}
 */
const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      })),
      message: 'Input validation failed. Please check your data.'
    });
  }
  next();
};

module.exports = { validateResult };
