/**
 * @file authMiddleware.js
 * @description JWT verification middleware protecting private endpoints.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware function to verify JWT from cookies or headers and attach the user object to the request.
 * @async
 * @function protect
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Promise<void>}
 */
const protect = async (req, res, next) => {
  let token;

  try {
    // 1. Check for token in Authorization Header (Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 2. Fallback: Parse from cookies if available in headers (HttpOnly Cookie)
    else if (req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) acc[key] = value;
        return acc;
      }, {});
      token = cookies.token;
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route, token missing',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey_change_in_production');

    // Attach user to the request object (excluding password)
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'User belonging to this token no longer exists',
      });
    }

    next();
  } catch (error) {
    console.error(`🛡️ Auth validation error: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route, token invalid or expired',
    });
  }
};

module.exports = { protect };
