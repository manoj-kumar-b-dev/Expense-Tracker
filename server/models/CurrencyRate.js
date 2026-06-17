/**
 * @file CurrencyRate.js
 * @description Mongoose schema and model for caching currency exchange rates relative to a base currency.
 */

const mongoose = require('mongoose');

const CurrencyRateSchema = new mongoose.Schema({
  base: {
    type: String,
    required: [true, 'Base currency is required'],
    uppercase: true,
    trim: true,
  },
  rates: {
    type: Map,
    of: Number,
    required: [true, 'Exchange rates map is required'],
  },
  fetchedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// Unique index on base currency to ensure we only have one cached rates document per base currency (e.g. USD)
CurrencyRateSchema.index({ base: 1 }, { unique: true });

module.exports = mongoose.model('CurrencyRate', CurrencyRateSchema);
