/**
 * @file authController.js
 * @description Controllers managing JWT authentication, session checkouts, and accounts validation.
 */

const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendEmailVerification } = require('../utils/emailService');

/**
 * Register a new user.
 * @route POST /api/auth/register
 * @async
 * @function register
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
exports.register = async (req, res, next) => {
  const { name, email, password, currency } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    // Instantiate user record
    const user = new User({
      name,
      email,
      password,
      currency: currency || 'USD',
      preferredCurrency: currency || 'USD',
      avatar: '',
    });

    // In development, auto-verify so SMTP is not required to log in
    if (process.env.NODE_ENV !== 'production') {
      user.isEmailVerified = true;
      await user.save();
      return res.status(201).json({
        success: true,
        message: 'Registration successful! You can now log in.',
      });
    }

    // Generate email verification token
    const verificationToken = user.getEmailVerificationToken();

    // Save user record
    await user.save();

    // Dispatch verification email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;

    let emailSent = true;
    try {
      await sendEmailVerification(user.email, verificationUrl);
    } catch (mailError) {
      console.error('Registration email dispatch failed:', mailError.message);
      emailSent = false;
    }

    return res.status(201).json({
      success: true,
      message: emailSent
        ? 'Registration successful! A verification link has been sent to your email.'
        : 'Registration successful, but verification email could not be sent. Please try signing in to resend the link.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log in an existing user.
 * @route POST /api/auth/login
 * @async
 * @function login
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find user and explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    // Compare credentials
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    // Guard: Ensure user has verified their email address
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address before logging in.',
        isEmailVerified: false,
      });
    }

    // Sign session
    const token = generateToken(res, user._id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        preferredCurrency: user.preferredCurrency || user.currency || 'USD',
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log out the current user by clearing cookies.
 * @route POST /api/auth/logout
 * @async
 * @function logout
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
exports.logout = async (req, res, next) => {
  try {
    // Clear cookies
    res.cookie('token', 'none', {
      httpOnly: true,
      expires: new Date(Date.now() + 5000), // expire cookie in 5s
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user details.
 * @route GET /api/auth/me
 * @async
 * @function getMe
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
exports.getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'User session not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};
