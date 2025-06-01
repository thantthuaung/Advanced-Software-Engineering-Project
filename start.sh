#!/bin/bash

# JCU Gym Management System - One-Click Starter
echo "🏋️‍♂️ Starting JCU Gym Management System..."
echo "================================================"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🚀 Starting development server..."
echo "📱 The application will open at: http://localhost:3000"
echo ""
echo "🔑 Admin Login:"
echo "   Email: admin@my.jcu.edu.au"
echo "   Password: admin123"
echo ""
echo "💡 Press Ctrl+C to stop the server"
echo "================================================"

# Start the application
npm run dev 