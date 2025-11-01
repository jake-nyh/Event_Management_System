# Event Management System Development Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18 or higher)
- **npm** or **yarn** (npm comes with Node.js)
- **PostgreSQL** (v15 or higher)
- **Git**
- **VS Code** (recommended) with the following extensions:
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - PostgreSQL

## Initial Project Setup

### 1. Create the Project Structure

```bash
# Create the main project directory
mkdir Event_Management_System
cd Event_Management_System

# Create frontend and backend directories
mkdir frontend backend

# Initialize the root package.json
npm init -y
```

### 2. Set Up Root Package.json

Update the root `package.json` with workspace configuration:

```json
{
  "name": "event-management-system",
  "version": "1.0.0",
  "description": "A comprehensive event management system",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "build": "npm run build:backend && npm run build:frontend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "test": "npm run test:backend && npm run test:frontend",
    "test:frontend": "cd frontend && npm run test",
    "test:backend": "cd backend && npm run test",
    "install:all": "npm install && cd frontend && npm install && cd ../backend && npm install"
  },
  "devDependencies": {
    "concurrently": "^7.6.0"
  }
}
```

### 3. Set Up Frontend (React + Vite + TypeScript)

```bash
# Navigate to frontend directory
cd frontend

# Initialize Vite React TypeScript project
npm create vite@latest . -- --template react-ts

# Install additional dependencies
npm install @reduxjs/toolkit react-redux react-router-dom
npm install axios react-query
npm install @stripe/react-stripe-js @stripe/stripe-js
npm install react-hook-form @hookform/resolvers yup
npm install react-hot-toast
npm install lucide-react

# Install development dependencies
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/node
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D prettier eslint-config-prettier eslint-plugin-prettier

# Initialize Tailwind CSS
npx tailwindcss init -p
```

Configure `frontend/tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Configure `frontend/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Set Up Backend (Express.js + TypeScript)

```bash
# Navigate to backend directory
cd ../backend

# Initialize package.json
npm init -y

# Install production dependencies
npm install express
npm install cors helmet morgan compression
npm install jsonwebtoken bcryptjs
npm install pg
npm install stripe
npm install qrcode
npm install nodemailer
npm install express-rate-limit
npm install joi
npm install multer
npm install xlsx

# Install development dependencies
npm install -D typescript @types/node @types/express
npm install -D @types/cors @types/morgan @types/compression
npm install -D @types/jsonwebtoken @types/bcryptjs
npm install -D @types/pg @types/qrcode @types/nodemailer
npm install -D @types/multer
npm install -D ts-node nodemon
npm install -D jest @types/jest supertest @types/supertest
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

Create `backend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    },
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "tests"
  ]
}
```

Update `backend/package.json` scripts:
```json
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix"
  }
}
```

### 5. Set Up PostgreSQL Database

```bash
# Create database
createdb event_management

# Connect to database and create schema
psql event_management
```

Create the initial database schema (save as `backend/src/database/schema.sql`):

```sql
-- Create Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('event_creator', 'customer', 'website_owner')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 5.00,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Ticket Types table
CREATE TABLE ticket_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity_available INTEGER NOT NULL,
    quantity_sold INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Tickets table
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_type_id UUID NOT NULL REFERENCES ticket_types(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_id UUID,
    qr_code VARCHAR(255) UNIQUE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'used', 'transferred', 'refunded')),
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    creator_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    stripe_payment_intent_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier_name VARCHAR(100) NOT NULL,
    monthly_fee DECIMAL(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Waiting List table
CREATE TABLE waiting_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quantity_requested INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, customer_id)
);

-- Create indexes for better performance
CREATE INDEX idx_events_creator_id ON events(creator_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_ticket_types_event_id ON ticket_types(event_id);
CREATE INDEX idx_tickets_customer_id ON tickets(customer_id);
CREATE INDEX idx_tickets_ticket_type_id ON tickets(ticket_type_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_event_id ON transactions(event_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_subscriptions_creator_id ON subscriptions(creator_id);
CREATE INDEX idx_waiting_list_event_id ON waiting_list(event_id);
CREATE INDEX idx_waiting_list_customer_id ON waiting_list(customer_id);
```

### 6. Environment Configuration

Create `backend/.env` file:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/event_management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

Create `frontend/.env` file:
```env
VITE_API_URL=http://localhost:3001/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### 7. Basic File Structure Setup

Create the basic directory structure:

```bash
# Backend directories
mkdir -p backend/src/{config,controllers,middleware,models,routes,services,utils,types,database/{migrations,seeds,procedures}}
mkdir -p backend/tests/{unit,integration,fixtures}

# Frontend directories
mkdir -p frontend/src/{components/{common,auth,events,tickets,admin},pages,hooks,services,store,types,utils,styles,assets/{images,icons,fonts}}
```

### 8. Git Configuration

Create `.gitignore` in the root directory:
```gitignore
# Dependencies
node_modules/
*/node_modules/

# Build outputs
dist/
build/
*/dist/
*/build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Database
*.sqlite
*.db

# Temporary files
tmp/
temp/
```

## Running the Development Environment

1. **Install all dependencies**:
   ```bash
   npm run install:all
   ```

2. **Set up the database**:
   ```bash
   # Create the database
   createdb event_management
   
   # Run the schema
   psql event_management < backend/src/database/schema.sql
   ```

3. **Start the development servers**:
   ```bash
   npm run dev
   ```

This will start both the frontend (on http://localhost:3000) and backend (on http://localhost:3001) servers concurrently.

## Next Steps

Once the basic setup is complete, you can start implementing the features according to the todo list:

1. Set up TypeScript configuration
2. Implement authentication system
3. Create database models
4. Build API endpoints
5. Develop frontend components
6. Integrate payment gateway
7. Add advanced features

## Development Best Practices

1. **Code Organization**: Follow the established folder structure
2. **Type Safety**: Use TypeScript interfaces for all data structures
3. **Error Handling**: Implement proper error handling in all layers
4. **Testing**: Write unit and integration tests for critical functionality
5. **Code Quality**: Use ESLint and Prettier for consistent code formatting
6. **Git Workflow**: Use feature branches and descriptive commit messages
7. **Documentation**: Keep API documentation updated

This setup provides a solid foundation for building the Event Management System with all the necessary tools and configurations in place.