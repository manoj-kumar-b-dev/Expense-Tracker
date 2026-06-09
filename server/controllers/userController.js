/**
 * @file userController.js
 * @description Controllers to manage user profiles, avatar uploads, and total account purges.
 */

const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

/**
 * Update current user profile details (name, email, preferred currency).
 * @route PUT /api/users/profile
 * @async
 * @function updateUserProfile
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
exports.updateUserProfile = async (req, res, next) => {
  const { name, email, currency } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    // Check if email is being updated and is already taken
    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) {
        return res.status(400).json({
          success: false,
          message: 'This email is already in use by another account',
        });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (currency) user.currency = currency;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload and save Base64 avatar representation.
 * @route POST /api/users/avatar
 * @async
 * @function uploadAvatar
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
exports.uploadAvatar = async (req, res, next) => {
  const { avatar } = req.body; // Expects a Base64-encoded image string

  try {
    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a base64 encoded image string',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { avatar } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Avatar uploaded and updated successfully',
      data: {
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Danger Zone: Completely purge a user account and all matching databases (transactions and budgets).
 * @route DELETE /api/users/account
 * @async
 * @function deleteAccount
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Purge data in parallel
    await Promise.all([
      Transaction.deleteMany({ userId }),
      Budget.deleteMany({ userId }),
      User.findByIdAndDelete(userId),
    ]);

    // Clear session cookies
    res.cookie('token', 'none', {
      httpOnly: true,
      expires: new Date(Date.now() + 1000),
    });

    return res.status(200).json({
      success: true,
      message: 'Account and all related financial records have been permanently deleted',
    });
  } catch (error) {
    next(error);
  }
};
