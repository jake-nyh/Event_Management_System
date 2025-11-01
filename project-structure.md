# Event Management System Project Structure

## Root Directory Structure

```
Event_Management_System/
├── README.md
├── .gitignore
├── docker-compose.yml (for local development)
├── package.json (root package.json for workspace management)
├── system-architecture.md
├── project-structure.md
├── frontend/                 # React + Vite + TypeScript
└── backend/                  # Express.js + TypeScript (includes database)
```

## Frontend Structure (React + Vite + TypeScript)

```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── assets/
├── src/
│   ├── main.tsx              # App entry point
│   ├── App.tsx               # Main App component
│   ├── vite-env.d.ts
│   ├── components/           # Reusable UI components
│   │   ├── common/           # Shared components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── auth/             # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ForgotPasswordForm.tsx
│   │   ├── events/           # Event-related components
│   │   │   ├── EventList.tsx
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventDetails.tsx
│   │   │   ├── EventForm.tsx
│   │   │   └── EventAnalytics.tsx
│   │   ├── tickets/          # Ticket-related components
│   │   │   ├── TicketPurchase.tsx
│   │   │   ├── TicketCard.tsx
│   │   │   ├── MyTickets.tsx
│   │   │   ├── TicketTransfer.tsx
│   │   │   └── RefundRequest.tsx
│   │   └── admin/            # Admin panel components
│   │       ├── Dashboard.tsx
│   │       ├── UserManagement.tsx
│   │       ├── CommissionSettings.tsx
│   │       └── SubscriptionManagement.tsx
│   ├── pages/                # Page components
│   │   ├── HomePage.tsx
│   │   ├── EventsPage.tsx
│   │   ├── EventDetailPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── AdminPage.tsx
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useEvents.ts
│   │   ├── useTickets.ts
│   │   └── useApi.ts
│   ├── services/             # API service functions
│   │   ├── api.ts            # Base API configuration
│   │   ├── authService.ts
│   │   ├── eventService.ts
│   │   ├── ticketService.ts
│   │   ├── paymentService.ts
│   │   └── adminService.ts
│   ├── store/                # State management
│   │   ├── index.ts          # Store configuration
│   │   ├── authSlice.ts
│   │   ├── eventSlice.ts
│   │   ├── ticketSlice.ts
│   │   └── uiSlice.ts
│   ├── types/                # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── event.ts
│   │   ├── ticket.ts
│   │   ├── user.ts
│   │   └── api.ts
│   ├── utils/                # Utility functions
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── validation.ts
│   │   └── formatters.ts
│   ├── styles/               # CSS/styling files
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── components/
│   └── assets/               # Static assets
│       ├── images/
│       ├── icons/
│       └── fonts/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Backend Structure (Express.js + TypeScript + Database)

```
backend/
├── src/
│   ├── app.ts                # Express app configuration
│   ├── server.ts             # Server startup file
│   ├── config/               # Configuration files
│   │   ├── database.ts
│   │   ├── auth.ts
│   │   ├── stripe.ts
│   │   └── environment.ts
│   ├── controllers/          # Route controllers
│   │   ├── authController.ts
│   │   ├── eventController.ts
│   │   ├── ticketController.ts
│   │   ├── paymentController.ts
│   │   ├── adminController.ts
│   │   └── analyticsController.ts
│   ├── middleware/           # Custom middleware
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── cors.ts
│   ├── models/               # Database models
│   │   ├── User.ts
│   │   ├── Event.ts
│   │   ├── Ticket.ts
│   │   ├── Transaction.ts
│   │   ├── Subscription.ts
│   │   └── WaitingList.ts
│   ├── routes/               # API routes
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── events.ts
│   │   ├── tickets.ts
│   │   ├── payments.ts
│   │   ├── admin.ts
│   │   └── analytics.ts
│   ├── services/             # Business logic services
│   │   ├── authService.ts
│   │   ├── eventService.ts
│   │   ├── ticketService.ts
│   │   ├── paymentService.ts
│   │   ├── commissionService.ts
│   │   ├── notificationService.ts
│   │   ├── qrCodeService.ts
│   │   └── exportService.ts
│   ├── utils/                # Utility functions
│   │   ├── logger.ts
│   │   ├── validators.ts
│   │   ├── helpers.ts
│   │   ├── constants.ts
│   │   └── emailTemplates.ts
│   ├── types/                # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── event.ts
│   │   ├── ticket.ts
│   │   ├── user.ts
│   │   ├── payment.ts
│   │   └── api.ts
│   └── database/             # Database related files
│       ├── connection.ts
│       ├── migrations/       # Database migration files
│       │   ├── 001_create_users_table.sql
│       │   ├── 002_create_events_table.sql
│       │   ├── 003_create_ticket_types_table.sql
│       │   ├── 004_create_tickets_table.sql
│       │   ├── 005_create_transactions_table.sql
│       │   ├── 006_create_subscriptions_table.sql
│       │   └── 007_create_waiting_list_table.sql
│       ├── seeds/            # Database seed files
│       │   ├── users.sql
│       │   ├── events.sql
│       │   └── subscriptions.sql
│       ├── schema.sql        # Complete database schema
│       └── procedures/       # Stored procedures and functions
│           ├── calculate_commission.sql
│           └── update_ticket_availability.sql
├── tests/                    # Test files
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── docs/                     # Backend documentation
│   ├── api-documentation.md
│   └── database-schema.md
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Key Configuration Files

### Root package.json (Workspace Management)
```json
{
  "name": "event-management-system",
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
    "test:backend": "cd backend && npm run test"
  },
  "devDependencies": {
    "concurrently": "^7.6.0"
  }
}
```

### Docker Compose (Local Development)
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: event_management
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/src/database/schema.sql:/docker-entrypoint-initdb.d/schema.sql

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/event_management
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
```

## Development Workflow

1. **Initial Setup**
   - Clone repository
   - Install dependencies with `npm install`
   - Set up environment variables
   - Start development environment with `npm run dev`

2. **Development Process**
   - Work on features in separate branches
   - Frontend developers work in `/frontend` directory
   - Backend developers work in `/backend` directory (including database)
   - Write tests for new functionality

3. **Code Organization Principles**
   - Keep components focused and single-purpose
   - Use TypeScript interfaces for type safety
   - Implement proper error handling
   - Follow RESTful API design principles
   - Use middleware for cross-cutting concerns

This simplified structure provides a clean separation between frontend and backend, with all database-related files contained within the backend directory as requested.