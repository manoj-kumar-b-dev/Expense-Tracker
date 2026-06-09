/**
 * @file errorMiddleware.js
 * @description Centralized error handler middleware.
 */

/**
 * Global Express error handling middleware.
 * @function errorHandler
 * @param {Object} err - Error object.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error console for development debugging
  console.error(`💥 System Error: ${err.stack || err}`);

  // 1. Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = { status: 404, message };
  }

  // 2. Mongoose Duplicate Key (11000)
  if (err.code === 11000) {
    const message = 'Duplicate field value entered. A record with this unique identifier already exists.';
    error = { status: 400, message };
  }

  // 3. Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = { status: 400, message };
  }

  // 4. JWT JsonWebTokenError
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid session token. Please authenticate again.';
    error = { status: 401, message };
  }

  // 5. JWT TokenExpiredError
  if (err.name === 'TokenExpiredError') {
    const message = 'Your session has expired. Please log in again.';
    error = { status: 401, message };
  }

  const statusCode = error.status || err.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = { errorHandler };
