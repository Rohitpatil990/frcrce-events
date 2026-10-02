#!/bin/bash

# Event Management System - Setup Script
# This script helps you set up and run the application

echo "=================================================="
echo "  Event Management System - FRCRCE"
echo "  Setup & Installation Script"
echo "=================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed or not in PATH"
    echo "Please install MongoDB from https://www.mongodb.com/try/download/community"
    echo "Or use MongoDB Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "🗄️  Database Setup"
echo "Make sure MongoDB is running before proceeding"
echo ""
read -p "Is MongoDB running? (y/n): " mongo_running

if [ "$mongo_running" != "y" ] && [ "$mongo_running" != "Y" ]; then
    echo ""
    echo "Please start MongoDB first:"
    echo "  - Linux/Mac: sudo systemctl start mongod"
    echo "  - Windows: net start MongoDB"
    echo "  - Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest"
    echo ""
    exit 0
fi

echo ""
read -p "Would you like to seed the database with test data? (y/n): " seed_db

if [ "$seed_db" = "y" ] || [ "$seed_db" = "Y" ]; then
    echo "🌱 Seeding database..."
    node seedData.js
fi

echo ""
echo "=================================================="
echo "  Setup Complete! ✅"
echo "=================================================="
echo ""
echo "To start the server:"
echo "  - Development mode: npm run dev"
echo "  - Production mode: npm start"
echo ""
echo "Server will be available at: http://localhost:3000"
echo ""
echo "Test Credentials:"
echo "  Admin:   admin@frcrce.ac.in / admin123"
echo "  Faculty: faculty@frcrce.ac.in / faculty123"
echo "  Student: student@frcrce.ac.in / student123"
echo ""
echo "=================================================="
