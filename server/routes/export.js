/**
 * @file export.js
 * @description Export routing rules mapping endpoints to PDF, Excel, and CSV actions.
 */

const express = require('express');
const { exportPDF, exportExcel, exportCSV } = require('../controllers/exportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Require JWT protect token verification middleware for all routes
router.use(protect);

router.get('/pdf', exportPDF);
router.get('/excel', exportExcel);
router.get('/csv', exportCSV);

module.exports = router;
