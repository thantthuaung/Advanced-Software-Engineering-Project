#!/bin/bash

# JCU Gym Management System - Enhanced One-Click Starter
echo "🏋️‍♂️ Starting JCU Gym Management System..."
echo "================================================"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Node.js is installed
if ! command_exists node; then
    echo "❌ Error: Node.js is not installed!"
    echo "   Please install Node.js from: https://nodejs.org/"
    echo "   Recommended version: 18.0.0 or higher"
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo "❌ Error: npm is not installed!"
    echo "   Please install npm (usually comes with Node.js)"
    exit 1
fi

# Display Node.js and npm versions
echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "   Make sure you're in the correct project directory."
    exit 1
fi

# Check if node_modules exists and is not empty
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
    echo "📦 Dependencies not found or incomplete..."
    echo "🔄 Installing/updating dependencies..."
    echo "   This may take a few minutes for first-time setup..."
    
    # Clean install to ensure fresh dependencies
    if [ -d "node_modules" ]; then
        echo "🧹 Cleaning existing node_modules..."
        rm -rf node_modules
    fi
    
    # Try npm ci first (faster, uses package-lock.json)
    if [ -f "package-lock.json" ]; then
        echo "📋 Attempting fast install using package-lock.json..."
        npm ci
        
        # If npm ci fails (like peer dependency conflicts), fall back to npm install
        if [ $? -ne 0 ]; then
            echo "⚠️  Fast install failed (likely due to dependency conflicts)"
            echo "🔄 Falling back to npm install to resolve dependencies..."
            echo "   This will update package-lock.json with compatible versions..."
            
            # Remove corrupted node_modules if any
            if [ -d "node_modules" ]; then
                rm -rf node_modules
            fi
            
            # Use npm install with legacy peer deps to handle conflicts
            npm install --legacy-peer-deps
            
            if [ $? -eq 0 ]; then
                echo "✅ Dependencies installed successfully with compatibility mode!"
                echo "💡 Note: package-lock.json has been updated to resolve conflicts"
            else
                echo "❌ Error: Failed to install dependencies even with compatibility mode!"
                echo "   Please try manually:"
                echo "   1. npm install --force"
                echo "   2. npm install --legacy-peer-deps"
                echo "   3. Delete package-lock.json and try: npm install"
                exit 1
            fi
        else
            echo "✅ Dependencies installed successfully using package-lock.json!"
        fi
    else
        echo "📋 No package-lock.json found, installing dependencies..."
        npm install
        
        if [ $? -eq 0 ]; then
            echo "✅ Dependencies installed successfully!"
        else
            echo "❌ Error: Failed to install dependencies!"
            echo "   Please check your internet connection and try again."
            echo "   You can also try: npm install --verbose"
            exit 1
        fi
    fi
else
    echo "✅ Dependencies already installed"
fi

# Check if Next.js is available
if [ ! -f "node_modules/.bin/next" ]; then
    echo "❌ Error: Next.js not found in dependencies!"
    echo "   Trying to reinstall dependencies..."
    npm install --legacy-peer-deps
fi

echo ""
echo "🚀 Starting development server..."
echo "📱 The application will be available at: http://localhost:3000"
echo ""
echo "🔑 Default Admin Login Credentials:"
echo "   Email: admin@my.jcu.edu.au"
echo "   Password: admin123"
echo ""
echo "👤 Demo Student Login:"
echo "   Email: demo@my.jcu.edu.au"
echo "   Password: demo123"
echo ""
echo "🎯 What you can do after startup:"
echo "   • 📊 Admin Dashboard: Manage users, sessions, and bookings"
echo "   • 📅 Book gym sessions and view schedules"
echo "   • 🏆 Track achievements and fitness progress"
echo "   • 🔔 Receive notifications and announcements"
echo "   • 💳 Manage payments and membership details"
echo ""
echo "🔐 Access Points:"
echo "   • 👥 Student Portal: http://localhost:3000"
echo "   • 🛡️  Admin Dashboard: http://localhost:3000/admin/login"
echo "   • 🏠 Regular User Login: http://localhost:3000/auth/login"
echo ""
echo "📋 How to Access Admin Dashboard:"
echo "   1. Open http://localhost:3000/admin/login in your browser"
echo "   2. Use admin credentials above to login"
echo "   3. You'll be redirected to the admin dashboard"
echo "   4. From there you can manage users, sessions, achievements, etc."
echo ""
echo "💡 Useful Commands:"
echo "   • Press Ctrl+C to stop the server"
echo "   • Open http://localhost:3000 in your browser"
echo "   • Check the console for any errors"
echo ""
echo "🔧 Troubleshooting:"
echo "   • If port 3000 is busy, try: npm run dev -- --port 3001"
echo "   • For database issues, check the data/ directory"
echo "   • View logs in the terminal for debugging"
echo ""
echo "📚 For more information, check the README.md file"
echo "================================================"

# Start the application with error handling
npm run dev

# Check if the server started successfully
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Error: Failed to start the development server!"
    echo "   Common solutions:"
    echo "   1. Make sure port 3000 is not already in use"
    echo "   2. Try: npm run dev -- --port 3001"
    echo "   3. Check for any error messages above"
    echo "   4. Try: npm install && npm run dev"
fi 