#!/bin/bash

echo "🚀 Setting up EcoRide Backend..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before continuing."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🗄️  Generating Prisma client..."
npx prisma generate

echo "🔄 Running database migrations..."
npx prisma migrate dev

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env file with your credentials"
echo "2. Make sure PostgreSQL is running"
echo "3. Run 'npm run dev' to start the development server"
