/**
 * @file currency.js
 * @description Currency endpoints router configuration.
 */

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getRatesUSD, getRatesByBase, refreshRates } = require('../controllers/currencyController');

const router = express.Router();

// All currency endpoints require JWT authentication
router.use(protect);

router.get('/rates', getRatesUSD);
router.get('/rates/:baseCurrency', getRatesByBase);
router.post('/refresh', refreshRates);

module.exports = router;
