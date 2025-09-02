#!/bin/bash

echo "🚀 Task Management API - Quick Start"
echo "====================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp env.example .env
    echo "⚠️  Please update the .env file with your configuration before continuing."
    echo "   Pay special attention to JWT_SECRET and database credentials."
    read -p "Press Enter when you're ready to continue..."
fi

echo "🐳 Starting MongoDB and Redis with Docker Compose..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building the application..."
npm run build

echo "🌱 Seeding the database..."
npm run seed

echo "🚀 Starting the application..."
npm run start:dev

echo ""
echo "🎉 Application is running!"
echo "📋 Test Credentials:"
echo "   Admin: admin@example.com / admin123"
echo "   Manager: manager@example.com / manager123"
echo "   User: user@example.com / user123"
echo ""
echo "🔗 API Documentation: http://localhost:3000"
echo "🏥 Health Check: http://localhost:3000/healthz"
echo ""
echo "To stop the application, press Ctrl+C"
echo "To stop Docker services: docker-compose down" 