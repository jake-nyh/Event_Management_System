#!/bin/bash

# Database setup script for Event Management System
# This script will create the PostgreSQL database and run migrations

echo "🚀 Setting up Event Management System Database..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   On macOS: brew install postgresql"
    echo "   On Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    exit 1
fi

# Check if PostgreSQL service is running
if ! pgrep -x "postgres" > /dev/null; then
    echo "⚠️  PostgreSQL service is not running. Starting it..."
    # For macOS with Homebrew
    if command -v brew &> /dev/null; then
        brew services start postgresql
    else
        echo "Please start PostgreSQL service manually and run this script again."
        exit 1
    fi
fi

# Database configuration
DB_NAME="event_management"
DB_USER="postgres"
DB_PASSWORD="password"
DB_HOST="localhost"
DB_PORT="5432"

echo "📊 Creating database '$DB_NAME'..."

# Create database (it might already exist)
createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || echo "Database already exists or creation failed"

# Update the .env file with the database connection string
echo "🔧 Updating .env file with database connection string..."
cat > .env << EOF
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
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

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
EOF

echo "✅ Database setup complete!"
echo "🎯 Next steps:"
echo "   1. Run 'pnpm db:migrate' to apply the migrations"
echo "   2. Run 'pnpm dev' to start the development server"