/**
 * @file User.js
 * @description Mongoose database model for User schema with password auto-hashing and comparison hooks.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, // Don't return password by default in queries
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
  },
  preferredCurrency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'],
    default: 'USD',
  },
  avatar: {
    type: String, // Stores Base64 representation of user profile image
    default: '',
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Pre-save Mongoose hook to hash user passwords prior to persisting in the DB.
 */
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Custom schema method to compare candidate passwords with hashed credentials.
 * @async
 * @method matchPassword
 * @param {string} enteredPassword - Candidate plain text password
 * @returns {Promise<boolean>} Resolves to true if passwords match, otherwise false.
 */
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Generate and hash password reset token
 * @method getResetPasswordToken
 * @returns {string} Raw unhashed reset token
 */
UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire to 10 minutes from now
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

/**
 * Generate and hash email verification token
 * @method getEmailVerificationToken
 * @returns {string} Raw unhashed verification token
 */
UserSchema.methods.getEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set expire to 24 hours from now
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;

  return verificationToken;
};

module.exports = mongoose.model('User', UserSchema);
