# 🚀 Vercel Deployment Guide - Expense Tracker API

## 📋 Table of Contents
1. [Overview](#overview)
2. [What Changed](#what-changed)
3. [Prerequisites](#prerequisites)
4. [Deployment Methods](#deployment-methods)
5. [Environment Variables Setup](#environment-variables-setup)
6. [Cron Jobs Configuration](#cron-jobs-configuration)
7. [Testing Before Deployment](#testing-before-deployment)
8. [Deployment Steps](#deployment-steps)
9. [Post-Deployment Verification](#post-deployment-verification)
10. [Alternative: External Cron Service](#alternative-external-cron-service)
11. [Troubleshooting](#troubleshooting)
12. [Production Checklist](#production-checklist)

---

## 🎯 Overview

Your Expense Tracker backend has been successfully converted for Vercel serverless deployment while **preserving 100% of existing functionality**:

✅ All REST API endpoints work identically  
✅ JWT Authentication preserved  
✅ MongoDB Atlas integration intact  
✅ All middleware functioning  
✅ All business logic unchanged  
✅ Cron jobs converted to Vercel Cron (scheduled endpoints)  

---

## 🔄 What Changed

### **Modified Files:**
1. **`config/db.js`** - Added connection caching for serverless optimization
2. **`server.js`** - Exports app for serverless, conditional server start
3. **`package.json`** - Added Node version requirement and test scripts

### **New Files Created:**
1. **`api/index.js`** - Vercel serverless entry point
2. **`api/cron/currency-refresh.js`** - Cron endpoint for currency rates
3. **`api/cron/recurring-transactions.js`** - Cron endpoint for recurring transactions
4. **`vercel.json`** - Vercel configuration (builds, routes, cron schedules)
5. **`.vercelignore`** - Files to exclude from deployment

### **Unchanged:**
- ✅ All controllers (100% preserved)
- ✅ All routes (100% preserved)
- ✅ All models (100% preserved)
- ✅ All middleware (100% preserved)
- ✅ All services (100% preserved)
- ✅ All utilities (100% preserved)
- ✅ Original cron files (kept for reference, not deployed)

---

## ✅ Prerequisites

### 1. **Vercel Account**
- Sign up at [vercel.com](https://vercel.com)
- Free Hobby plan works for development
- **Cron Jobs require Hobby plan** (free tier supports cron)

### 2. **MongoDB Atlas**
- Your MongoDB must be accessible from the internet
- Update Network Access to allow connections from anywhere (0.0.0.0/0) OR add Vercel's IP ranges

### 3. **Node.js Version**
- Node.js 18.x or higher (specified in package.json)

### 4. **Vercel CLI (Optional)**
```bash
npm install -g vercel
```

---

## 🚢 Deployment Methods

You can deploy using either:

### **Method 1: Vercel Dashboard (Recommended for first deployment)**
- Easy GUI interface
- Best for beginners
- Good for Git-based deployments

### **Method 2: Vercel CLI**
- Fast deployment from terminal
- Good for quick iterations
- More control over deployment

Both methods are covered in the [Deployment Steps](#deployment-steps) section below.

---

## 🔐 Environment Variables Setup

You need to configure these environment variables in Vercel:

### **Required Variables:**

```bash
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=30d

# Environment
NODE_ENV=production

# CORS - Your Frontend URL
FRONTEND_URL=https://your-frontend.vercel.app

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourapp.com

# Cron Job Security (OPTIONAL but recommended)
CRON_SECRET=your_random_secret_for_cron_endpoints
```

### **How to Add in Vercel Dashboard:**
1. Go to your project settings
2. Click "Environment Variables"
3. Add each variable:
   - Name: `MONGO_URI`
   - Value: `mongodb+srv://...`
   - Environment: Production (or All)
4. Click "Save"

### **How to Add via Vercel CLI:**
```bash
vercel env add MONGO_URI
# Paste your MongoDB URI when prompted
```

---

## ⏰ Cron Jobs Configuration

Your application has **2 critical cron jobs** that have been converted to Vercel Cron endpoints:

### **1. Currency Refresh Job**
- **Endpoint:** `/api/cron/currency-refresh`
- **Schedule:** Daily at midnight UTC (`0 0 * * *`)
- **Purpose:** Refreshes currency exchange rates

### **2. Recurring Transactions Job**
- **Endpoint:** `/api/cron/recurring-transactions`
- **Schedule:** Daily at 00:05 UTC (`5 0 * * *`)
- **Purpose:** Processes recurring transactions and creates new transaction records

### **How Vercel Cron Works:**

Vercel Cron is configured in `vercel.json`:
```json
"crons": [
  {
    "path": "/api/cron/currency-refresh",
    "schedule": "0 0 * * *"
  },
  {
    "path": "/api/cron/recurring-transactions",
    "schedule": "5 0 * * *"
  }
]
```

**Schedule Format:** Cron expression (minute hour day month dayOfWeek)
- `0 0 * * *` = Every day at midnight UTC
- `5 0 * * *` = Every day at 00:05 UTC

### **Cron Security (Optional but Recommended):**

The cron endpoints check for a `CRON_SECRET` to prevent unauthorized access:

1. Generate a random secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. Add it to Vercel environment variables:
```
CRON_SECRET=your_generated_secret_here
```

3. Vercel Cron will automatically include `Authorization: Bearer <CRON_SECRET>` header

### **Vercel Cron Limitations:**
- Available on **all plans** (including Hobby/Free)
- Maximum execution time: 10 seconds (can be extended with paid plans)
- Runs in your deployment region

---

## 🧪 Testing Before Deployment

### **1. Test Local Development Mode:**

Your server still works in traditional mode for local development:

```bash
cd server
npm install
npm run dev
```

This will:
- Start the server on port 5000
- Connect to MongoDB
- Initialize the original node-cron jobs
- Work exactly as before

### **2. Test Cron Endpoints Locally:**

You can manually trigger the cron endpoints to test them:

**Test Currency Refresh:**
```bash
# Start your server first
npm run dev

# In another terminal, test the endpoint:
curl -X POST http://localhost:5000/api/cron/currency-refresh \
  -H "Authorization: Bearer your_cron_secret"
```

**Test Recurring Transactions:**
```bash
curl -X POST http://localhost:5000/api/cron/recurring-transactions \
  -H "Authorization: Bearer your_cron_secret"
```

---

## 🚀 Deployment Steps

### **Method 1: Deploy via Vercel Dashboard (Recommended)**

#### **Step 1: Push to GitHub**
```bash
cd server
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

#### **Step 2: Import Project in Vercel**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your repository
4. Configure project:
   - **Framework Preset:** Other
   - **Root Directory:** `server` (if monorepo) or `.` (if server is root)
   - **Build Command:** Leave empty
   - **Output Directory:** Leave empty
5. Click "Deploy"

#### **Step 3: Add Environment Variables**
1. Go to Project Settings → Environment Variables
2. Add all variables from the [Environment Variables](#environment-variables-setup) section
3. Redeploy if needed

---

### **Method 2: Deploy via Vercel CLI**

#### **Step 1: Login to Vercel**
```bash
vercel login
```

#### **Step 2: Navigate to Server Directory**
```bash
cd server
```

#### **Step 3: Deploy**

**For Production:**
```bash
vercel --prod
```

**For Preview:**
```bash
vercel
```

#### **Step 4: Add Environment Variables**
```bash
vercel env add MONGO_URI
vercel env add JWT_SECRET
vercel env add JWT_EXPIRE
vercel env add NODE_ENV
vercel env add FRONTEND_URL
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_USER
vercel env add SMTP_PASS
vercel env add FROM_EMAIL
vercel env add CRON_SECRET
```

Then redeploy:
```bash
vercel --prod
```

---

## ✅ Post-Deployment Verification

### **1. Test API Health Endpoint:**
```bash
curl https://your-api.vercel.app/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Expense Tracker API is healthy and operational",
  "timestamp": "2024-01-20T12:00:00.000Z",
  "environment": "vercel-serverless"
}
```

### **2. Test Authentication:**
```bash
# Register a new user
curl -X POST https://your-api.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### **3. Test Protected Endpoints:**
```bash
# Get current user (requires token from login/register)
curl https://your-api.vercel.app/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **4. Verify Cron Jobs:**

Go to Vercel Dashboard → Your Project → Settings → Crons

You should see:
- ✅ `/api/cron/currency-refresh` - `0 0 * * *`
- ✅ `/api/cron/recurring-transactions` - `5 0 * * *`

### **5. Test Cron Endpoints Manually (Optional):**
```bash
# Test currency refresh (requires CRON_SECRET)
curl -X POST https://your-api.vercel.app/api/cron/currency-refresh \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test recurring transactions
curl -X POST https://your-api.vercel.app/api/cron/recurring-transactions \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### **6. Monitor Logs:**

View deployment logs in Vercel Dashboard:
- Go to your project
- Click on "Deployments"
- Select the latest deployment
- View "Functions" logs to see:
  - Database connections
  - API requests
  - Cron job executions

---

## 🔄 Alternative: External Cron Service

If you prefer NOT to use Vercel Cron (e.g., staying on a free tier that doesn't support cron), you can use external services:

### **Option 1: GitHub Actions (Free)**

Create `.github/workflows/cron-jobs.yml` in your **server** directory or root:

```yaml
name: Scheduled Cron Jobs

on:
  schedule:
    # Currency refresh - Daily at midnight UTC
    - cron: '0 0 * * *'
    # Recurring transactions - Daily at 00:05 UTC
    - cron: '5 0 * * *'

jobs:
  trigger-cron:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Currency Refresh
        if: github.event.schedule == '0 0 * * *'
        run: |
          curl -X POST https://your-api.vercel.app/api/cron/currency-refresh \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"

      - name: Trigger Recurring Transactions
        if: github.event.schedule == '5 0 * * *'
        run: |
          curl -X POST https://your-api.vercel.app/api/cron/recurring-transactions \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

Add `CRON_SECRET` to GitHub repository secrets:
- Go to repository Settings → Secrets and variables → Actions
- Add secret: `CRON_SECRET`

### **Option 2: EasyCron (Free tier available)**

1. Sign up at [easycron.com](https://www.easycron.com)
2. Create cron jobs:

**Currency Refresh:**
- URL: `https://your-api.vercel.app/api/cron/currency-refresh`
- Cron Expression: `0 0 * * *`
- HTTP Method: POST
- Custom Header: `Authorization: Bearer YOUR_CRON_SECRET`

**Recurring Transactions:**
- URL: `https://your-api.vercel.app/api/cron/recurring-transactions`
- Cron Expression: `5 0 * * *`
- HTTP Method: POST
- Custom Header: `Authorization: Bearer YOUR_CRON_SECRET`

### **Option 3: cron-job.org (Free)**

1. Sign up at [cron-job.org](https://cron-job.org)
2. Create similar cron jobs as above

---

## 🐛 Troubleshooting

### **Issue: "Failed to connect to MongoDB"**

**Solution:**
1. Check MongoDB Atlas Network Access:
   - Go to MongoDB Atlas → Network Access
   - Add IP: `0.0.0.0/0` (allow all) OR add Vercel IP ranges
2. Verify `MONGO_URI` environment variable in Vercel
3. Test connection string locally first

### **Issue: "Not authorized to access this route"**

**Solution:**
- Check JWT_SECRET is set in Vercel environment variables
- Ensure JWT_SECRET matches between deployments
- Verify token is included in Authorization header

### **Issue: Cron jobs not running**

**Solution:**
1. Verify Vercel plan supports cron jobs (Hobby plan required)
2. Check `vercel.json` cron configuration is valid
3. View function logs in Vercel Dashboard
4. Try manually triggering the cron endpoint to test logic

### **Issue: "Module not found" errors**

**Solution:**
- Ensure all dependencies are in `dependencies` (not `devDependencies`)
- Run `npm install` locally to verify package.json is correct
- Clear Vercel cache and redeploy

### **Issue: Function timeout**

**Solution:**
- Default timeout is 10 seconds on Hobby plan
- Optimize database queries
- Consider upgrading to Pro plan for 60-second timeout
- Check `vercel.json` functions.maxDuration setting

### **Issue: CORS errors**

**Solution:**
1. Add your frontend URL to `FRONTEND_URL` environment variable
2. Ensure frontend sends credentials:
   ```javascript
   axios.defaults.withCredentials = true;
   ```
3. Verify CORS middleware is working

---

## ✅ Production Checklist

Before going live, verify:

### **Security:**
- [ ] Change all default secrets (JWT_SECRET, CRON_SECRET)
- [ ] Use strong, randomly generated secrets (min 32 characters)
- [ ] Enable HTTPS only (Vercel does this automatically)
- [ ] Configure MongoDB IP whitelist properly
- [ ] Review and update CORS origins
- [ ] Use environment variables for ALL sensitive data
- [ ] Enable rate limiting (already configured in authRoutes.js)

### **Environment Variables:**
- [ ] All required variables set in Vercel
- [ ] No .env files committed to Git
- [ ] MONGO_URI points to production database
- [ ] NODE_ENV set to "production"
- [ ] FRONTEND_URL points to production frontend
- [ ] SMTP credentials configured correctly

### **Database:**
- [ ] MongoDB Atlas cluster is in production tier (not free M0 for production)
- [ ] Database backups configured
- [ ] Indexes created for performance
- [ ] Connection string uses proper credentials

### **Monitoring:**
- [ ] Set up Vercel Analytics (optional)
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Monitor function execution times
- [ ] Check cron job execution logs daily (first week)

### **Testing:**
- [ ] All API endpoints tested on production
- [ ] Authentication flow works end-to-end
- [ ] File uploads work (if applicable)
- [ ] Cron jobs triggered manually and verified
- [ ] Error handling tested
- [ ] Frontend successfully connects to API

### **Documentation:**
- [ ] Update README with production URL
- [ ] Document deployment process
- [ ] Share environment variables securely with team
- [ ] Document cron job monitoring process

### **Performance:**
- [ ] Database connection caching enabled (✅ already implemented)
- [ ] Response times acceptable (<2s for most endpoints)
- [ ] Consider CDN for static assets
- [ ] MongoDB queries optimized

---

## 📊 Expected Performance

### **Cold Start:**
- First request after inactivity: 1-3 seconds
- Includes database connection establishment

### **Warm Requests:**
- Subsequent requests: 100-500ms
- Uses cached database connection

### **Cron Jobs:**
- Currency refresh: 2-5 seconds
- Recurring transactions: 5-10 seconds (depends on number of rules)

---

## 🔗 Useful Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Express.js Guide](https://expressjs.com/)

---

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Review MongoDB Atlas metrics
3. Test endpoints with curl/Postman
4. Check Network tab in browser DevTools
5. Review this guide's troubleshooting section

---

## 🎉 Success!

Once deployed successfully, your API will be:
- ✅ Running on Vercel's global edge network
- ✅ Auto-scaling based on traffic
- ✅ HTTPS enabled by default
- ✅ Cron jobs running automatically
- ✅ Monitoring available in Vercel Dashboard

Your API URL will be: `https://your-project-name.vercel.app`

Update your frontend to use this URL in the axios configuration!

---

**Last Updated:** June 2026  
**Vercel API Version:** 2  
**Node.js Version:** 18.x+
