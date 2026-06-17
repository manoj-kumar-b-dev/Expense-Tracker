/**
 * @file emailService.js
 * @description Email sending helper utility configured with Nodemailer. Implements Ethereal mock fallback for local dev.
 */

const nodemailer = require('nodemailer');

let transporterInstance = null;

/**
 * Initializes and retrieves the Nodemailer transporter instance.
 * Automatically falls back to creating an Ethereal mock account if SMTP env properties are missing.
 * @async
 * @function getTransporter
 * @returns {Promise<Object|null>} Nodemailer transporter object
 */
const getTransporter = async () => {
  if (transporterInstance) {
    return transporterInstance;
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporterInstance = nodemailer.createTransport({
      host,
      port: parseInt(port, 10) || 587,
      secure: port === '465', // true for port 465, false for others
      auth: {
        user,
        pass,
      },
    });
    console.log('📡 SMTP email transporter initialized using .env configurations.');
    return transporterInstance;
  }

  console.log('⚠️ SMTP configuration not found in .env. Attempting to create mock Ethereal SMTP account...');
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporterInstance = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    // Set variables dynamically for fallback fromEmail field
    process.env.SMTP_USER = testAccount.user;
    process.env.FROM_EMAIL = 'no-reply@expense-tracker.com';
    
    console.log(`✉️ Ethereal Mock SMTP Credentials Generated successfully:`);
    console.log(`   Host: smtp.ethereal.email`);
    console.log(`   User: ${testAccount.user}`);
    console.log(`   Pass: ${testAccount.pass}`);
    console.log(`   👉 Use these for debugging emails during development.`);
    return transporterInstance;
  } catch (error) {
    console.error('❌ Failed to establish Ethereal SMTP mock account:', error.message);
    return null;
  }
};

/**
 * Sends generic HTML email.
 * @async
 * @function sendEmail
 * @param {Object} options - Email recipient, subject, and html payload.
 */
const sendEmail = async (options) => {
  const transporter = await getTransporter();
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER || 'no-reply@expense-tracker.com';

  const mailOptions = {
    from: `"Expense Tracker Support" <${fromEmail}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  if (transporter) {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to [${options.email}] | MessageID: ${info.messageId}`);
    
    // Log preview link if Ethereal is used
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 Ethereal preview URL: ${previewUrl}`);
    }
    return info;
  } else {
    console.warn('⚠️ Transporter unavailable. Printing email contents to terminal console:');
    console.log('========================= OFFLINE EMAIL LOG =========================');
    console.log(`TO:      ${options.email}`);
    console.log(`SUBJECT: ${options.subject}`);
    console.log(`BODY:`);
    console.log(options.html);
    console.log('======================================================================');
    return { messageId: 'offline-console-stub' };
  }
};

/**
 * Sends password reset email.
 * @async
 * @function sendPasswordResetEmail
 * @param {string} email - Recipient email.
 * @param {string} resetUrl - Complete URL link with reset token.
 */
const sendPasswordResetEmail = async (email, resetUrl) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F3F4F6; margin: 0; padding: 0; color: #1F2937; }
        .container { max-width: 600px; margin: 40px auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #E5E7EB; }
        .header { background-color: #4F46E5; padding: 32px; text-align: center; }
        .header h1 { color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .body { padding: 40px 32px; line-height: 1.6; }
        .body p { margin-top: 0; margin-bottom: 24px; font-size: 15px; color: #4B5563; }
        .cta-container { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; background-color: #4F46E5; color: #FFFFFF !important; text-decoration: none; padding: 14px 30px; font-weight: 600; font-size: 14px; border-radius: 12px; transition: background-color 0.2s; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.15); }
        .btn:hover { background-color: #4338CA; }
        .footer { background-color: #F9FAFB; padding: 24px 32px; text-align: center; border-top: 1px solid #E5E7EB; font-size: 12px; color: #9CA3AF; }
        .footer p { margin: 0; }
        .warning { background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; border-radius: 8px; margin: 24px 0; font-size: 13px; color: #78350F; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Expense Tracker</h1>
        </div>
        <div class="body">
          <p>Hi there,</p>
          <p>We received a request to reset the password for your Expense Tracker account. Click the button below to choose a new password. This link will expire in <strong>10 minutes</strong>.</p>
          
          <div class="cta-container">
            <a href="${resetUrl}" target="_blank" class="btn">Reset Password</a>
          </div>
          
          <div class="warning">
            If you did not request a password reset, please ignore this email or contact support if you have security concerns. No changes have been made to your account yet.
          </div>
          
          <p style="font-size: 13px; color: #9CA3AF; margin-bottom: 0;">
            If you are having trouble with the button above, copy and paste this URL into your browser:<br>
            <a href="${resetUrl}" target="_blank" style="color: #4F46E5; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Expense Tracker. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    email,
    subject: 'Reset Your Expense Tracker Password',
    html,
  });
};

/**
 * Sends verification email.
 * @async
 * @function sendEmailVerification
 * @param {string} email - Recipient email.
 * @param {string} verificationUrl - Complete URL link with verification token.
 */
const sendEmailVerification = async (email, verificationUrl) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Email</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F3F4F6; margin: 0; padding: 0; color: #1F2937; }
        .container { max-width: 600px; margin: 40px auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #E5E7EB; }
        .header { background-color: #10B981; padding: 32px; text-align: center; }
        .header h1 { color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .body { padding: 40px 32px; line-height: 1.6; }
        .body p { margin-top: 0; margin-bottom: 24px; font-size: 15px; color: #4B5563; }
        .cta-container { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; background-color: #10B981; color: #FFFFFF !important; text-decoration: none; padding: 14px 30px; font-weight: 600; font-size: 14px; border-radius: 12px; transition: background-color 0.2s; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.15); }
        .btn:hover { background-color: #059669; }
        .footer { background-color: #F9FAFB; padding: 24px 32px; text-align: center; border-top: 1px solid #E5E7EB; font-size: 12px; color: #9CA3AF; }
        .footer p { margin: 0; }
        .info { background-color: #ECFDF5; border-left: 4px solid #10B981; padding: 16px; border-radius: 8px; margin: 24px 0; font-size: 13px; color: #065F46; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Expense Tracker</h1>
        </div>
        <div class="body">
          <p>Welcome to Expense Tracker!</p>
          <p>Thank you for signing up. Please verify your email address to unlock your account and begin tracking your finances securely. This link is valid for <strong>24 hours</strong>.</p>
          
          <div class="cta-container">
            <a href="${verificationUrl}" target="_blank" class="btn">Verify Email Address</a>
          </div>
          
          <div class="info">
            If you did not create an Expense Tracker account, please ignore this email.
          </div>
          
          <p style="font-size: 13px; color: #9CA3AF; margin-bottom: 0;">
            If you are having trouble with the button above, copy and paste this URL into your browser:<br>
            <a href="${verificationUrl}" target="_blank" style="color: #10B981; word-break: break-all;">${verificationUrl}</a>
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Expense Tracker. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    email,
    subject: 'Verify Your Expense Tracker Account',
    html,
  });
};

module.exports = {
  sendPasswordResetEmail,
  sendEmailVerification,
};
