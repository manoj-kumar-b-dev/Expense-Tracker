/**
 * @file analyticsRoutes.js
 * @description Analytics charts routes mapping trends and summaries.
 */

const express = require('express');
const {
  getMonthlyAnalytics,
  getCategoryAnalytics,
  getTrendAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/monthly', getMonthlyAnalytics);
router.get('/category', getCategoryAnalytics);
router.get('/trend', getTrendAnalytics);

module.exports = router;
