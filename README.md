# Aura Wealth — Premium MERN Stack Expense & Budget Tracker

A high-fidelity, production-ready **Expense Tracker** web application engineered with the MERN stack (MongoDB, Express, React, Node.js). Designed for optimal performance, detailed cash-flow analytics, precise budget pacing, secure authentication (JWT with secure HttpOnly cookies + Bearer tokens), input validation schemas, and high-performance streaming CSV exports.

---

## 🗂️ Project Architecture

```text
expense-tracker/
├── server/
│   ├── config/
│   │   └── db.js                 # Mongoose connection with automatic reconnect retry logic
│   ├── controllers/
│   │   ├── authController.js     # User registration, login sessions, session checkouts
│   │   ├── transactionController.js # CRUD, filtering, searching, sort indexing, CSV streams
│   │   ├── budgetController.js    # Budget allocations, live warning pacing status
│   │   ├── userController.js     # Metadata settings, avatar base64 uploads, purges
│   │   └── analyticsController.js # Comparative bars, segment pies, trend graphs
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT header/cookie parser protect middleware
│   │   ├── errorMiddleware.js    # Centralized custom error formatting and standard responses
│   │   └── validateMiddleware.js # express-validator input checks guard
│   ├── models/
│   │   ├── User.js               # User Schema (auto bcrypt hashing, comparisons)
│   │   ├── Transaction.js        # Transactions (indexing for category/date query speeds)
│   │   └── Budget.js             # Budgets (unique month/year allocations validation)
│   ├── routes/
│   │   ├── authRoutes.js         # Register, login, session pathways
│   │   ├── transactionRoutes.js  # Transaction CRUD & CSV stream routes
│   │   ├── budgetRoutes.js       # Budget configuration & live aggregates routes
│   │   ├── userRoutes.js         # Settings & details routes
│   │   └── analyticsRoutes.js    # Visual charts analytics data routes
│   ├── utils/
│   │   ├── generateToken.js      # Signed JWT generator & HttpOnly cookie binder
│   │   └── csvExporter.js        # High-performance json2csv parsing exporter
│   ├── .env.example              # Key environment variables mapping templates
│   └── server.js                 # Express server configuration (CORS, Helmet, Morgan, parsers)
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.js  # Global Axios client (headers inject, 401 logs, 500 alerts)
│   │   ├── components/
│   │   │   ├── ui/               # Reusable UI (Button, Input, Modal, Badge, Skeleton)
│   │   │   ├── layout/           # Scaffolding (Sidebar, Navbar, PageWrapper responsive panels)
│   │   │   ├── charts/           # Recharts wraps (BarChart, PieChart, LineChart widgets)
│   │   │   └── cards/            # Display cards (StatCard, TransactionCard, BudgetCard)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Global Auth provider (login, registrations, logouts)
│   │   │   └── ThemeContext.jsx  # Dark/Light theme class modifier (Dark by default)
│   │   ├── hooks/
│   │   │   ├── useTransactions.js # Hook for CRUD transactions & CSV stream downloads
│   │   │   ├── useBudgets.js     # Hook for CRUD budgets & aggregates statuses
│   │   │   └── useDebounce.js    # Inputs change debouncer for searches
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Auth Sign-In screen
│   │   │   ├── Register.jsx      # Auth Sign-Up screen
│   │   │   ├── Dashboard.jsx     # Balances, monthly bar chart, recent rows, quickFAB
│   │   │   ├── Transactions.jsx  # Rich filter ledger table, edit modals, downloads
│   │   │   ├── AddTransaction.jsx# 4-Step wizard form with smooth visual transitions
│   │   │   ├── Analytics.jsx     # Cumulative metrics page (line, bar, pie aggregations)
│   │   │   ├── Budget.jsx        # Spending limits progress card meters, exceeded warnings
│   │   │   ├── Profile.jsx       # Name/email updates, Base64 profile photo previews
│   │   │   └── Settings.jsx      # Theme switchers, notification settings, delete zones
│   │   ├── utils/
│   │   │   ├── formatCurrency.js # Locale currency formatter helper
│   │   │   └── categoryIcons.jsx # Category badge color dictionaries & Lucide components
│   │   ├── App.jsx               # Master React routes gates (public/protected switches)
│   │   └── main.jsx              # DOM root bootstrap file
│   ├── postcss.config.js
│   ├── tailwind.config.js        # Design tokens, custom animations, brand colors
│   └── vite.config.js
```

---

## 🎨 UI/UX Features & Standards

1. **Rich Glassmorphic Design System**: Vibrant color pallets (primary indigo-violet `#6C63FF`, success `#10B981`, danger `#EF4444`, warning `#F59E0B`), glassmorphic panels (`backdrop-blur-md bg-white/70 border border-white/20`), custom fonts (Inter via Google Fonts), and visual glowing blobs backdrop elements.
2. **Animated Transitions**: High-performance CSS micro-animations (`animate-fadeIn 0.3s`, `animate-slideUp 0.4s`) for interactive page loads and transition wizard forms.
3. **Pacing Meters Shifting**: Budget cards feature active progress meters that automatically shift colors from green ➔ yellow at **75% utilization** ➔ red danger badges at **90% utilization** and exceeded warning flags.
4. **Animated Stat Counters**: Numerical balances and income/expense values count up from 0 to target totals smoothly upon initial mounts.
5. **Class-Based Theme Selector**: Dark theme default, with instant local-storage persistent toggle switches.

---

## 🚀 Step-by-Step Developer Setup

### 📋 Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (v9+ recommended)
- **MongoDB** (Local server or Atlas URL URI link)

### 1. Server Configuration
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Create your active `.env` configuration file from the template:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` variables if required (default is configured for standard local MongoDB instances):
   ```ini
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/expense-tracker
   JWT_SECRET=supersecretkey_change_in_production
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```
4. Start the server (development mode with Nodemon):
   ```bash
   npm run dev
   ```

### 2. Client Configuration
1. Open a new terminal and navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Launch the Vite React development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to:
   ```text
   http://localhost:5173
   ```

---

## 🛡️ Core APIs Endpoints Index

### 🔐 Authentication (`/api/auth`)
- `POST /register` — Register a new account. Validates request body, hashes credentials, sets HttpOnly cookie, and returns a signed JWT.
- `POST /login` — Log in a user. Compares hashes, signs session, sets cookie, and returns token.
- `POST /logout` — Ends user session by clearing active token cookies.
- `GET /me` — Retrieves current user profile details (requires protect validation).

### 📝 Transactions (`/api/transactions`)
- `GET /` — Search and filter transactions list (requires protect validation). Supports text queries (`search`), classification (`type`), categories (`category`), date ranges (`startDate`/`endDate`), sorting (`sort=date:desc`), and pagination (`page=1&limit=10`).
- `POST /` — Records a new transaction (requires protect validation).
- `PUT /:id` — Modifies an existing transaction (requires protect validation and user ownership checks).
- `DELETE /:id` — Deletes a transaction record (requires protect validation and user ownership checks).
- `GET /export/csv` — Stream and download the filtered transaction history matching parameter queries as a CSV download file.

### 🐷 Budgets (`/api/budgets`)
- `GET /` — Retrieves budgets (requires protect validation).
- `POST /` — Configures a new category budget limit for a specific month and year (requires protect validation). Prevents duplicate allocations.
- `PUT /:id` — Updates limit levels (requires protect validation and ownership checks).
- `DELETE /:id` — Deletes a budget plan (requires protect validation and ownership checks).
- `GET /status` — Live status aggregates calculator (requires protect validation). Groups expenditures by category within the target month, compares limits, and formats utilization rates alongside warnings (`normal` | `warning` | `exceeded`).

### 📊 Analytics (`/api/analytics`)
- `GET /monthly` — Aggregates and returns income vs expense totals over the past 6 months chronologically for bar charts.
- `GET /category` — Aggregates cumulative expenses grouped by category in the current month for pie charts.
- `GET /trend` — Computes chronological daily income and expense transaction sums over the past 30 days for trend line charts.

### ⚙️ User Settings (`/api/users`)
- `PUT /profile` — Updates profile metadata (name, email, currencies).
- `POST /avatar` — Uploads and updates a Base64-encoded profile picture.
- `DELETE /account` — Danger zone accounts wipe. Drops user credentials, budgets limits, and transaction history in parallel, clears session tokens, and returns success signals.
