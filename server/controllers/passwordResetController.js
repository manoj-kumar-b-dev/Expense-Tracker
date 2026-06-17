/**
 * @file passwordResetController.js
 * @description Controllers for password recovery operations and user email verification.
 */

const crypto = require('crypto');
const User = require('../models/User');
const { sendPasswordResetEmail, sendEmailVerification } = require('../utils/emailService');

/**
 * Handle forgot password request.
 * @route POST /api/auth/forgot-password
 * @async
 * @function forgotPassword
 */
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'There is no account registered under this email address.',
      });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();

    // Persist hashed token details without validating other fields (pre-save hook bypassed if password is not modified)
    await user.save({ validateBeforeSave: false });

    // Build absolute path to frontend URL endpoint
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);

      return res.status(200).json({
        success: true,
        message: 'A password reset link has been dispatched to your email address.',
      });
    } catch (mailError) {
      console.error('Mail dispatch failed in forgotPassword:', mailError.message);
      // Rollback database changes on email failure
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent. Please try again later.',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Handle password reset execution.
 * @route PUT /api/auth/reset-password/:resetToken
 * @async
 * @function resetPassword
 */
exports.resetPassword = async (req, res, next) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  try {
    // Re-hash received raw URL token to check against saved database hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Find valid user matches
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'The password reset token is invalid or has expired.',
      });
    }

    // Set new password (pre-save hook will hash this)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully. You can now sign in using your new password.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle email verification processing.
 * @route GET /api/auth/verify-email/:verificationToken
 * @async
 * @function verifyEmail
 */
exports.verifyEmail = async (req, res, next) => {
  const { verificationToken } = req.params;

  try {
    // Hash url token to query database
    const hashedToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'The email verification link is invalid or has expired.',
      });
    }

    // Update verification properties
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: 'Email address verified successfully. You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle manual resending of email verification link.
 * @route POST /api/auth/resend-verification
 * @async
 * @function resendVerification
 */
exports.resendVerification = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'There is no account registered under this email address.',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'This account email is already verified.',
      });
    }

    // Generate verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;

    try {
      await sendEmailVerification(user.email, verificationUrl);

      return res.status(200).json({
        success: true,
        message: 'A fresh verification email link has been sent to your inbox.',
      });
    } catch (mailError) {
      console.error('Mail dispatch failed in resendVerification:', mailError.message);
      return res.status(500).json({
        success: false,
        message: 'Could not send verification email. Please try again later.',
      });
    }
  } catch (error) {
    next(error);
  }
};
