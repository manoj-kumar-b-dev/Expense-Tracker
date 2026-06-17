/**
 * @file recurringController.js
 * @description Controller actions for managing recurring transaction rules.
 * All routes are protected by JWT auth middleware (protect).
 *
 * Endpoints:
 *   GET    /api/recurring               → getAll
 *   POST   /api/recurring               → create
 *   PUT    /api/recurring/:id           → update
 *   DELETE /api/recurring/:id           → remove
 *   PATCH  /api/recurring/:id/toggle    → toggle (pause / resume)
 *   GET    /api/recurring/:id/history   → getHistory (auto-generated transactions)
 *   GET    /api/recurring/upcoming      → getUpcoming (next 30 days preview)
 */

const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');
const calculateNextDate = require('../utils/calculateNextDate');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: resolve the initial nextExecutionDate from startDate + frequency.
// If startDate is today or in the past, the first run is today; otherwise
// it is the startDate itself (the cron will pick it up on that future day).
// ─────────────────────────────────────────────────────────────────────────────
const resolveNextExecutionDate = (startDate, frequency) => {
  const start = new Date(startDate);
  const todayUTC = new Date();
  todayUTC.setUTCHours(0, 0, 0, 0);
  start.setUTCHours(0, 0, 0, 0);

  // If start is today or in the past → schedule for today so the cron picks it up
  if (start <= todayUTC) {
    return todayUTC;
  }
  return start;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/recurring — Return all recurring rules for the logged-in user
// ─────────────────────────────────────────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const rules = await RecurringTransaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: rules.length,
      data: rules,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/recurring/upcoming — Return rules due in the next 30 days
// Used by Dashboard "Upcoming This Month" section
// ─────────────────────────────────────────────────────────────────────────────
exports.getUpcoming = async (req, res, next) => {
  try {
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    const in30Days = new Date(now);
    in30Days.setUTCDate(in30Days.getUTCDate() + 30);

    const upcoming = await RecurringTransaction.find({
      userId: req.user._id,
      isActive: true,
      nextExecutionDate: { $gte: now, $lte: in30Days },
      $or: [{ endDate: null }, { endDate: { $gte: now } }],
    }).sort({ nextExecutionDate: 1 });

    // Compute summary totals
    const summary = upcoming.reduce(
      (acc, rule) => {
        if (rule.type === 'income') acc.totalIncome += rule.amount;
        else acc.totalExpense += rule.amount;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );

    return res.status(200).json({
      success: true,
      count: upcoming.length,
      summary: {
        totalIncome: Number(summary.totalIncome.toFixed(2)),
        totalExpense: Number(summary.totalExpense.toFixed(2)),
      },
      data: upcoming,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/recurring — Create a new recurring transaction rule
// ─────────────────────────────────────────────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const {
      title, amount, currency, type, category,
      frequency, startDate, endDate, notes, paymentMethod,
    } = req.body;

    const nextExecutionDate = resolveNextExecutionDate(startDate, frequency);

    const rule = await RecurringTransaction.create({
      userId: req.user._id,
      title,
      amount: parseFloat(amount),
      currency: (currency || req.user.preferredCurrency || req.user.currency || 'USD').toUpperCase(),
      type,
      category,
      frequency,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      nextExecutionDate,
      notes: notes || '',
      paymentMethod: paymentMethod || '',
    });

    return res.status(201).json({
      success: true,
      message: 'Recurring transaction rule created successfully',
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/recurring/:id — Update an existing recurring rule
// ─────────────────────────────────────────────────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const rule = await RecurringTransaction.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Recurring rule not found' });
    }
    if (rule.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this rule' });
    }

    const allowedKeys = [
      'title', 'amount', 'currency', 'type', 'category',
      'frequency', 'startDate', 'endDate', 'notes', 'paymentMethod', 'isActive',
    ];

    allowedKeys.forEach((key) => {
      if (req.body[key] !== undefined) {
        rule[key] = req.body[key];
      }
    });

    // Recalculate nextExecutionDate if scheduling params changed
    if (req.body.startDate || req.body.frequency) {
      rule.nextExecutionDate = resolveNextExecutionDate(rule.startDate, rule.frequency);
    }

    // Ensure endDate null handling
    if (req.body.endDate === null || req.body.endDate === '') {
      rule.endDate = null;
    }

    await rule.save();

    return res.status(200).json({
      success: true,
      message: 'Recurring rule updated successfully',
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/recurring/:id — Delete the rule only; preserve generated transactions
// ─────────────────────────────────────────────────────────────────────────────
exports.remove = async (req, res, next) => {
  try {
    const rule = await RecurringTransaction.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Recurring rule not found' });
    }
    if (rule.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this rule' });
    }

    // ⚠️  Intentionally does NOT delete associated Transaction records — those
    // are real historical entries in the user's ledger and must be preserved.
    await rule.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Recurring rule deleted. Already-generated transactions have been preserved.',
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/recurring/:id/toggle — Pause or resume a recurring rule
// ─────────────────────────────────────────────────────────────────────────────
exports.toggle = async (req, res, next) => {
  try {
    const rule = await RecurringTransaction.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Recurring rule not found' });
    }
    if (rule.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this rule' });
    }

    rule.isActive = !rule.isActive;
    await rule.save();

    const statusLabel = rule.isActive ? 'resumed' : 'paused';
    return res.status(200).json({
      success: true,
      message: `Recurring rule ${statusLabel} successfully`,
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/recurring/:id/history — Return all auto-generated transactions for a rule
// ─────────────────────────────────────────────────────────────────────────────
exports.getHistory = async (req, res, next) => {
  try {
    const rule = await RecurringTransaction.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Recurring rule not found' });
    }
    if (rule.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this rule' });
    }

    const history = await Transaction.find({
      userId: req.user._id,
      recurringId: rule._id,
    }).sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
