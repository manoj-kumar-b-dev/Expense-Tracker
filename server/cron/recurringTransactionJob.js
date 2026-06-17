/**
 * @file recurringTransactionJob.js
 * @description Daily cron job that auto-inserts Transaction records for all active
 * recurring rules whose nextExecutionDate has been reached.
 *
 * Schedule: 00:05 UTC every day ('5 0 * * *').
 *
 * Key behaviours:
 *  1. Back-fill: if the server was down for N days, a while-loop catches up by
 *     inserting one transaction per missed interval until nextExecutionDate > today.
 *  2. Auto-deactivate: if a rule's endDate has passed after updating, isActive is
 *     set to false automatically.
 *  3. Fault isolation: per-record try/catch ensures one bad rule never crashes the
 *     entire job run.
 */

const cron = require('node-cron');
const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');
const calculateNextDate = require('../utils/calculateNextDate');

/**
 * Processes all due recurring rules and inserts corresponding Transaction documents.
 * @async
 * @function processRecurringTransactions
 */
const processRecurringTransactions = async () => {
  const todayUTC = new Date();
  todayUTC.setUTCHours(0, 0, 0, 0);

  console.log(`🔁 [RecurringJob] Starting run at ${new Date().toISOString()}`);

  // 1. Query all active rules that are due today or overdue (back-fill scenario)
  const dueRules = await RecurringTransaction.find({
    isActive: true,
    nextExecutionDate: { $lte: todayUTC },
    $or: [
      { endDate: null },
      { endDate: { $gte: todayUTC } },
    ],
  });

  console.log(`🔁 [RecurringJob] Found ${dueRules.length} rule(s) to process.`);

  let successCount = 0;
  let failureCount = 0;

  for (const rule of dueRules) {
    try {
      // ── Back-fill loop ───────────────────────────────────────────────────────
      // Keep inserting until nextExecutionDate advances past today.
      // This handles cases where the server was offline for multiple days.
      while (rule.nextExecutionDate <= todayUTC) {
        // Check endDate before each insert to stop mid-back-fill correctly
        if (rule.endDate && rule.nextExecutionDate > new Date(rule.endDate)) {
          console.log(`⏹️  [RecurringJob] Rule "${rule.title}" (${rule._id}) has passed its end date. Deactivating.`);
          rule.isActive = false;
          break;
        }

        // Create the Transaction document
        await Transaction.create({
          userId: rule.userId,
          type: rule.type,
          amount: rule.amount,
          originalAmount: rule.amount,
          originalCurrency: rule.currency,
          category: rule.category,
          title: rule.title,
          description: rule.notes || '',
          date: new Date(rule.nextExecutionDate), // Use scheduled date, not today
          recurringId: rule._id,
        });

        console.log(`✅ [RecurringJob] Inserted transaction for rule "${rule.title}" on ${rule.nextExecutionDate.toISOString().split('T')[0]}`);

        // Advance the schedule
        rule.lastExecutedDate = new Date(rule.nextExecutionDate);
        rule.nextExecutionDate = calculateNextDate(rule.nextExecutionDate, rule.frequency);
        successCount++;
      }

      // ── Post-loop endDate check ──────────────────────────────────────────────
      // After advancing, if the newly computed nextExecutionDate is beyond endDate,
      // proactively mark the rule as inactive so it never queued again.
      if (rule.isActive && rule.endDate && rule.nextExecutionDate > new Date(rule.endDate)) {
        console.log(`⏹️  [RecurringJob] Rule "${rule.title}" has no future executions remaining. Deactivating.`);
        rule.isActive = false;
      }

      await rule.save();
    } catch (err) {
      // Fault-isolated: log the error and continue processing remaining rules
      failureCount++;
      console.error(`❌ [RecurringJob] Failed to process rule "${rule.title}" (${rule._id}): ${err.message}`);
    }
  }

  console.log(`🔁 [RecurringJob] Completed. ✅ ${successCount} inserted | ❌ ${failureCount} failed.`);
};

/**
 * Initializes and registers the recurring transaction cron schedule.
 * Follows the same pattern as currencyRefresh.js.
 * @function initRecurringJob
 */
const initRecurringJob = () => {
  // Schedule: 00:05 UTC daily — runs 5 minutes after midnight to ensure date rollover
  cron.schedule('5 0 * * *', async () => {
    console.log('⏰ [RecurringJob] Daily trigger fired (00:05 UTC).');
    try {
      await processRecurringTransactions();
    } catch (err) {
      console.error(`💥 [RecurringJob] Unhandled error in job runner: ${err.message}`);
    }
  }, {
    scheduled: true,
    timezone: 'UTC',
  });

  console.log('✅ [RecurringJob] Daily recurring transaction cron registered (00:05 UTC).');
};

// Export both for use in server.js and for manual testing
module.exports = initRecurringJob;
module.exports.processRecurringTransactions = processRecurringTransactions;
