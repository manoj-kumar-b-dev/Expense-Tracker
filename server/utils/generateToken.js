/**
 * @file generateToken.js
 * @description JWT token generator that creates a signed web token and sets a secure HttpOnly cookie.
 */

const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token, binds it to an HTTP-only cookie, and returns the token string.
 * @function generateToken
 * @param {Object} res - Express response object.
 * @param {string} userId - User Mongoose ID.
 * @returns {string} The signed JWT token.
 */
const generateToken = (res, userId) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'supersecretkey_change_in_production',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    secure: process.env.NODE_ENV === 'production', // true in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('token', token, cookieOptions);

  return token;
};

module.exports = generateToken;
