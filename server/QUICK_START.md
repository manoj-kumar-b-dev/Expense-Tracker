# ⚡ Quick Start - Deploy to Vercel in 5 Minutes

## 🚀 Fastest Path to Deployment

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Navigate to Server Directory
```bash
cd server
```

### Step 3: Login to Vercel
```bash
vercel login
```

### Step 4: Deploy
```bash
vercel --prod
```

### Step 5: Add Environment Variables

Run these commands and paste your values when prompted:

```bash
vercel env add MONGO_URI
# Paste: mongodb+srv://username:password@cluster.mongodb.net/expense-tracker

vercel env add JWT_SECRET
# Paste: your_super_secret_jwt_key

vercel env add JWT_EXPIRE
# Paste: 30d

vercel env add NODE_ENV
# Paste: production

vercel env add FRONTEND_URL
# Paste: https://your-frontend.vercel.app

vercel env add SMTP_HOST
# Paste: smtp.gmail.com

vercel env add SMTP_PORT
# Paste: 587

vercel env add SMTP_USER
# Paste: your-email@gmail.com

vercel env add SMTP_PASS
# Paste: your-app-password

vercel env add FROM_EMAIL
# Paste: noreply@yourapp.com

vercel env add CRON_SECRET
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Then paste the generated value
```

### Step 6: Redeploy with Environment Variables
```bash
vercel --prod
```

### Step 7: Test Your API
```bash
curl https://your-project-name.vercel.app/api/health
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

## ✅ Done!

Your API is now live at: `https://your-project-name.vercel.app`

---

## 📋 MongoDB Atlas Setup (If Not Already Done)

### Allow Vercel to Connect:
1. Go to MongoDB Atlas Dashboard
2. Click "Network Access" in the left sidebar
3. Click "Add IP Address"
4. Choose "Allow Access from Anywhere" (0.0.0.0/0)
5. Click "Confirm"

---

## 🔧 Verify Cron Jobs

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Crons
4. Verify you see:
   - ✅ `/api/cron/currency-refresh` - Daily at 00:00 UTC
   - ✅ `/api/cron/recurring-transactions` - Daily at 00:05 UTC

---

## 🐛 Quick Troubleshooting

**Problem: MongoDB connection failed**
- Check MongoDB Atlas Network Access allows 0.0.0.0/0
- Verify MONGO_URI is correct

**Problem: Cron jobs not visible**
- Ensure you're on Vercel Hobby plan (free tier with cron support)
- Check `vercel.json` exists in your project

**Problem: API returns 404**
- Verify deployment succeeded
- Check Vercel deployment logs

---

## 📚 Need More Details?

Read the full guide: [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)

---

## 🎯 Next Steps

1. Update your frontend to use the new API URL
2. Test all endpoints
3. Monitor the first cron job execution (check logs tomorrow)
4. Set up error monitoring (optional - Sentry, LogRocket, etc.)
