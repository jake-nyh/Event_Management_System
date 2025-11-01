# Event Management System

A comprehensive event management platform built with TypeScript, React, Express.js, and PostgreSQL.

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** as build tool
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Zustand** for state management
- **React Query** for server state management
- **React Router** for navigation
- **React Hook Form** with Zod for form validation

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** for database management
- **PostgreSQL** as database
- **JWT** for authentication
- **Stripe** for payment processing
- **bcryptjs** for password hashing

## Project Structure

```
Event_Management_System/
├── frontend/                 # React + Vite + TypeScript
├── backend/                  # Express.js + TypeScript
├── docs/                     # Documentation
├── package.json              # Root package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v15 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Event_Management_System
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:

**Backend (.env):**
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/event_management
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3001/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

4. Set up the database:
```bash
# Create database
createdb event_management

# Run migrations
cd backend
npm run db:generate
npm run db:push
```

5. Start the development servers:
```bash
npm run dev
```

This will start both the frontend (http://localhost:3000) and backend (http://localhost:3001) servers.

## Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend
- `npm run test` - Run tests for both frontend and backend
- `npm run install:all` - Install dependencies for all packages

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

### Backend
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio

## Features

### User Management
- User registration and authentication
- Role-based access control (Event Creator, Customer, Website Owner)
- JWT-based authentication

### Event Management
- Create, edit, and delete events
- Configure ticket types and pricing
- Event analytics and reporting

### Ticket System
- Purchase tickets with Stripe integration
- QR code generation for tickets
- Ticket transfer and refund functionality
- Waiting list for sold-out events

### Commission & Subscriptions
- Commission management for website owners
- Subscription tiers for event creators
- Revenue analytics and reporting

## API Documentation

API endpoints are documented in the `/docs` directory and can be accessed when the backend is running.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.