# Event Management System - Project Setup Guide

## Table of Contents
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher) or **pnpm** (v8.x)
- **PostgreSQL** (v15 or higher)
- **Git** (v2.x)
- **Code Editor** (VS Code recommended)

### Verify Installation

```bash
node --version    # Should output v18.x or higher
npm --version     # Should output v9.x or higher
git --version     # Should output v2.x or higher
psql --version    # Should output PostgreSQL 15.x or higher
```

---

## Project Structure

```
Event_Management_System/
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── database/       # Database schema and connection
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic services
│   │   ├── middleware/     # Authentication, validation
│   │   └── server.ts       # Entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── store/         # Zustand state management
│   │   └── App.tsx        # App entry point
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Event Management System <your-email@gmail.com>

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Stripe Configuration (optional for mock payment)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

### 4. Run Database Migrations

```bash
npm run db:migrate
# or
pnpm db:migrate
```

### 5. (Optional) Seed Database

```bash
npm run db:seed
# or
pnpm db:seed
```

### 6. Start Backend Server

**Development mode (with hot reload):**
```bash
npm run dev
# or
pnpm dev
```

**Production mode:**
```bash
npm run build
npm start
# or
pnpm build
pnpm start
```

The backend server will start at `http://localhost:5000`

---

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
cp .env.example .env
```

Edit the `.env` file:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Stripe Publishable Key (for payment UI)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

### 4. Start Frontend Development Server

```bash
npm run dev
# or
pnpm dev
```

The frontend will start at `http://localhost:5173`

---

## Database Setup

### Option 1: Local PostgreSQL

#### 1. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE event_management_db;

# Create user (optional)
CREATE USER event_admin WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE event_management_db TO event_admin;

# Exit
\q
```

#### 2. Update DATABASE_URL

```env
DATABASE_URL=postgresql://event_admin:your_password@localhost:5432/event_management_db
```

### Option 2: Neon (Cloud PostgreSQL)

#### 1. Create Neon Account

- Visit https://neon.tech/
- Sign up for a free account
- Create a new project

#### 2. Get Connection String

- Copy the connection string from your Neon dashboard
- Ensure it includes `?sslmode=require`

#### 3. Update DATABASE_URL

```env
DATABASE_URL=postgresql://username:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

### Database Schema

The database includes 7 tables:
- `users` - User accounts with roles
- `events` - Event information
- `ticketTypes` - Ticket pricing tiers
- `tickets` - Individual ticket records
- `transactions` - Payment transactions
- `subscriptions` - Creator subscription tiers
- `waitingList` - Waiting list entries

---

## Environment Configuration

### Backend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | development |
| `PORT` | Backend server port | Yes | 5000 |
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | - |
| `JWT_EXPIRES_IN` | Token expiration time | No | 7d |
| `EMAIL_HOST` | SMTP host | Yes | smtp.gmail.com |
| `EMAIL_PORT` | SMTP port | Yes | 587 |
| `EMAIL_USER` | Email account | Yes | - |
| `EMAIL_PASSWORD` | Email app password | Yes | - |
| `EMAIL_FROM` | From email address | Yes | - |
| `FRONTEND_URL` | Frontend URL for CORS | Yes | http://localhost:5173 |
| `STRIPE_SECRET_KEY` | Stripe secret key | No | - |

### Frontend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | Yes | http://localhost:5000/api |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe public key | No | - |

### Gmail App Password Setup

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account Settings > Security
3. Select "App passwords"
4. Generate a new app password for "Mail"
5. Use this password in `EMAIL_PASSWORD`

---

## Running the Application

### Development Mode

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **API Health Check**: http://localhost:5000/api/health

### Test Accounts

After seeding the database, you can use these test accounts:

**Event Creator:**
- Email: `creator@example.com`
- Password: `Test@123`

**Customer:**
- Email: `customer@example.com`
- Password: `Test@123`

**Admin:**
- Email: `admin@example.com`
- Password: `Test@123`

---

## Deployment

### Database Deployment (Neon)

1. Create a Neon project at https://neon.tech/
2. Copy the connection string
3. Update `DATABASE_URL` in production environment
4. Run migrations: `npm run db:migrate`

### Backend Deployment (Railway/Render)

#### Railway

1. Create account at https://railway.app/
2. Create new project from GitHub repository
3. Add environment variables from `.env`
4. Deploy automatically on push

#### Render

1. Create account at https://render.com/
2. Create new Web Service
3. Connect GitHub repository
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Add environment variables

### Frontend Deployment (Vercel)

1. Create account at https://vercel.com/
2. Import GitHub repository
3. Framework preset: Vite
4. Root directory: `frontend`
5. Build command: `npm run build`
6. Output directory: `dist`
7. Add environment variables (`VITE_API_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`)
8. Deploy

### Production Environment Variables

Update production URLs:

**Backend `.env`:**
```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
DATABASE_URL=postgresql://...@neon.tech/...?sslmode=require
```

**Frontend `.env`:**
```env
VITE_API_URL=https://your-backend.railway.app/api
```

---

## Troubleshooting

### Common Issues

#### Backend won't start

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:** PostgreSQL is not running or DATABASE_URL is incorrect
```bash
# Check PostgreSQL status
pg_ctl status

# Start PostgreSQL (Mac)
brew services start postgresql@15

# Start PostgreSQL (Linux)
sudo systemctl start postgresql
```

#### Database migration fails

**Problem:** `Error: relation "users" already exists`

**Solution:** Database already initialized, skip migration or reset database
```bash
# Reset database (WARNING: Deletes all data)
npm run db:drop
npm run db:migrate
```

#### CORS errors in frontend

**Problem:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:** Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
```env
FRONTEND_URL=http://localhost:5173
```

#### Email not sending

**Problem:** `Error: Invalid login`

**Solution:** Use Gmail App Password, not regular password
1. Enable 2FA on Google Account
2. Generate App Password
3. Update `EMAIL_PASSWORD` in `.env`

#### JWT token errors

**Problem:** `Error: jwt malformed`

**Solution:** Clear localStorage and login again
```javascript
// In browser console
localStorage.clear()
```

#### Port already in use

**Problem:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:** Kill process using the port
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port in .env
PORT=5001
```

### Development Tips

1. **Hot Reload Not Working**
   - Restart dev server
   - Clear `node_modules` and reinstall

2. **Database Schema Changes**
   - Always create new migration files
   - Never edit existing migrations
   - Test migrations before deploying

3. **Environment Variables Not Loading**
   - Restart dev server after changing `.env`
   - Ensure `.env` is in correct directory
   - Check variable names match exactly

4. **TypeScript Errors**
   - Run `npm run type-check` to see all errors
   - Update `@types/*` packages if needed
   - Clear TypeScript cache: Delete `.tsbuildinfo`

---

## Additional Resources

- **Backend API Documentation**: See `backend/README.md`
- **Frontend Components**: See `frontend/README.md`
- **Database Schema**: See `DATABASE-ERD.md`
- **Deployment Guide**: See `Chapter 14 - Deployment.md`

---

## Support

For issues or questions:
1. Check this troubleshooting guide
2. Review relevant chapter documentation
3. Check GitHub issues
4. Contact project maintainer

---

**Last Updated**: November 29, 2024
