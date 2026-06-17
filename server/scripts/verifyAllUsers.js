/**
 * @file verifyAllUsers.js
 * @description One-shot dev utility: marks all existing users in MongoDB as email-verified.
 * Run once with: node scripts/verifyAllUsers.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.\n');

    const result = await User.updateMany(
      { isEmailVerified: false },
      {
        $set: {
          isEmailVerified: true,
          emailVerificationToken: undefined,
          emailVerificationExpire: undefined,
        },
      }
    );

    console.log(`✅ Done! ${result.modifiedCount} user(s) marked as email-verified.`);
    if (result.modifiedCount === 0) {
      console.log('   (All users were already verified, or no users exist yet.)');
    }
  } catch (err) {
    console.error('❌ Script failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
})();
