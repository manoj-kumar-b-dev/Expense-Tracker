/**
 * @file User.js
 * @description Mongoose database model for User schema with password auto-hashing and comparison hooks.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
  avatar: {
    type: String, // Stores Base64 representation of user profile image
    default: '',
  },
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

module.exports = mongoose.model('User', UserSchema);
