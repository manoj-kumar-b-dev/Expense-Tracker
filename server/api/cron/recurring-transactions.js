/**
 * @file api/cron/recurring-transactions.js
 * @description Vercel Cron Job endpoint for processing recurring transactions.
 * This endpoint is called by Vercel Cron on a schedule defined in vercel.json.
 * 
 * Schedule: Daily at 00:05 UTC (5 0 * * *)
 * 
 * This replaces the node-cron implementation from cron/recurringTransactionJob.js
 * which cannot run in serverless environments.
 */

const connectDB = require('../../config/db');
const RecurringTransaction = require('../../models/RecurringTransaction');
const Transaction = require('../../models/Transaction');
const calculateNextDate = require('../../utils/calculateNextDate');

/**
 * Processes all due recurring rules and inserts corresponding Transaction documents.
 * Identical logic to the original cron/recurringTransactionJob.js
 * @async
 * @function processRecurringTransactions
 */
const processRecurringTransactions = async () => {
  const todayUTC = new Date();
  todayUTC.setUTCHours(0, 0, 0, 0);

  console.log(`🔁 [Vercel Cron] Starting recurring transactions run at ${new Date().toISOString()}`);

  // 1. Query all active rules that are due today or overdue (back-fill scenario)
  const dueRules = await RecurringTransaction.find({
    isActive: true,
    nextExecutionDate: { $lte: todayUTC },
    $or: [
      { endDate: null },
      { endDate: { $gte: todayUTC } },
    ],
  });

  console.log(`🔁 [Vercel Cron] Found ${dueRules.length} rule(s) to process.`);

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
          console.log(`⏹️  [Vercel Cron] Rule "${rule.title}" (${rule._id}) has passed its end date. Deactivating.`);
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

        console.log(`✅ [Vercel Cron] Inserted transaction for rule "${rule.title}" on ${rule.nextExecutionDate.toISOString().split('T')[0]}`);

        // Advance the schedule
        rule.lastExecutedDate = new Date(rule.nextExecutionDate);
        rule.nextExecutionDate = calculateNextDate(rule.nextExecutionDate, rule.frequency);
        successCount++;
      }

      // ── Post-loop endDate check ──────────────────────────────────────────────
      // After advancing, if the newly computed nextExecutionDate is beyond endDate,
      // proactively mark the rule as inactive so it never queued again.
      if (rule.isActive && rule.endDate && rule.nextExecutionDate > new Date(rule.endDate)) {
        console.log(`⏹️  [Vercel Cron] Rule "${rule.title}" has no future executions remaining. Deactivating.`);
        rule.isActive = false;
      }

      await rule.save();
    } catch (err) {
      // Fault-isolated: log the error and continue processing remaining rules
      failureCount++;
      console.error(`❌ [Vercel Cron] Failed to process rule "${rule.title}" (${rule._id}): ${err.message}`);
    }
  }

  console.log(`🔁 [Vercel Cron] Completed. ✅ ${successCount} inserted | ❌ ${failureCount} failed.`);

  return { successCount, failureCount, totalProcessed: dueRules.length };
};

/**
 * Serverless function handler for recurring transactions cron job.
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 */
module.exports = async (req, res) => {
  // Security: Verify the request is from Vercel Cron
  const authHeader = req.headers.authorization;
  
  // Check if CRON_SECRET is set and validate it
  if (process.env.CRON_SECRET) {
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    if (authHeader !== expectedAuth) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid cron secret'
      });
    }
  }

  console.log('⏰ [Vercel Cron] Recurring transactions job triggered at', new Date().toISOString());

  try {
    // Connect to database (will use cached connection if available)
    await connectDB();

    // Process recurring transactions
    const result = await processRecurringTransactions();

    console.log('✅ [Vercel Cron] Recurring transactions processing completed successfully');

    return res.status(200).json({
      success: true,
      message: 'Recurring transactions processed successfully',
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [Vercel Cron] Recurring transactions processing failed:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Recurring transactions processing failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
