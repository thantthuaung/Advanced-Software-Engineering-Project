@echo off
title JCU Gym Management System - Enhanced Starter

echo 🏋️‍♂️ Starting JCU Gym Management System...
echo ================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js is not installed!
    echo    Please install Node.js from: https://nodejs.org/
    echo    Recommended version: 18.0.0 or higher
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: npm is not installed!
    echo    Please install npm (usually comes with Node.js)
    pause
    exit /b 1
)

REM Display Node.js and npm versions
echo ✅ Node.js version: 
node --version
echo ✅ npm version: 
npm --version
echo.

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ Error: package.json not found!
    echo    Make sure you're in the correct project directory.
    pause
    exit /b 1
)

REM Check if node_modules exists and is not empty
if not exist "node_modules" (
    echo 📦 Dependencies not found...
    echo 🔄 Installing dependencies...
    echo    This may take a few minutes for first-time setup...
    goto install_deps
)

REM Check if node_modules is empty
dir /b "node_modules" 2>nul | findstr . >nul
if errorlevel 1 (
    echo 📦 Dependencies incomplete...
    echo 🔄 Installing/updating dependencies...
    goto install_deps
)

echo ✅ Dependencies already installed
goto start_server

:install_deps
REM Clean install to ensure fresh dependencies
if exist "node_modules" (
    echo 🧹 Cleaning existing node_modules...
    rmdir /s /q "node_modules"
)

REM Try npm ci first (faster, uses package-lock.json)
if exist "package-lock.json" (
    echo 📋 Attempting fast install using package-lock.json...
    npm ci
    
    if errorlevel 1 (
        echo ⚠️  Fast install failed (likely due to dependency conflicts)
        echo 🔄 Falling back to npm install to resolve dependencies...
        echo    This will update package-lock.json with compatible versions...
        
        REM Remove corrupted node_modules if any
        if exist "node_modules" (
            rmdir /s /q "node_modules"
        )
        
        REM Use npm install with legacy peer deps to handle conflicts
        npm install --legacy-peer-deps
        
        if errorlevel 1 (
            echo ❌ Error: Failed to install dependencies even with compatibility mode!
            echo    Please try manually:
            echo    1. npm install --force
            echo    2. npm install --legacy-peer-deps
            echo    3. Delete package-lock.json and try: npm install
            pause
            exit /b 1
        ) else (
            echo ✅ Dependencies installed successfully with compatibility mode!
            echo 💡 Note: package-lock.json has been updated to resolve conflicts
        )
    ) else (
        echo ✅ Dependencies installed successfully using package-lock.json!
    )
) else (
    echo 📋 No package-lock.json found, installing dependencies...
    npm install
    
    if errorlevel 1 (
        echo ❌ Error: Failed to install dependencies!
        echo    Please check your internet connection and try again.
        echo    You can also try: npm install --verbose
        pause
        exit /b 1
    ) else (
        echo ✅ Dependencies installed successfully!
    )
)

:start_server
REM Check if Next.js is available
if not exist "node_modules\.bin\next.cmd" (
    echo ❌ Error: Next.js not found in dependencies!
    echo    Trying to reinstall dependencies...
    npm install --legacy-peer-deps
)

echo.
echo 🚀 Starting development server...
echo 📱 The application will be available at: http://localhost:3000
echo.
echo 🔑 Default Admin Login Credentials:
echo    Email: admin@my.jcu.edu.au
echo    Password: admin123
echo.
echo 👤 Demo Student Login:
echo    Email: demo@my.jcu.edu.au
echo    Password: demo123
echo.
echo 🎯 What you can do after startup:
echo    • 📊 Admin Dashboard: Manage users, sessions, and bookings
echo    • 📅 Book gym sessions and view schedules
echo    • 🏆 Track achievements and fitness progress
echo    • 🔔 Receive notifications and announcements
echo    • 💳 Manage payments and membership details
echo.
echo 🔐 Access Points:
echo    • 👥 Student Portal: http://localhost:3000
echo    • 🛡️  Admin Dashboard: http://localhost:3000/admin/login
echo    • 🏠 Regular User Login: http://localhost:3000/auth/login
echo.
echo 📋 How to Access Admin Dashboard:
echo    1. Open http://localhost:3000/admin/login in your browser
echo    2. Use admin credentials above to login
echo    3. You'll be redirected to the admin dashboard
echo    4. From there you can manage users, sessions, achievements, etc.
echo.
echo 💡 Useful Commands:
echo    • Press Ctrl+C to stop the server
echo    • Open http://localhost:3000 in your browser
echo    • Check the console for any errors
echo.
echo 🔧 Troubleshooting:
echo    • If port 3000 is busy, try: npm run dev -- --port 3001
echo    • For database issues, check the data/ directory
echo    • View logs in the terminal for debugging
echo.
echo 📚 For more information, check the README.md file
echo ================================================

REM Start the application with error handling
npm run dev

if errorlevel 1 (
    echo.
    echo ❌ Error: Failed to start the development server!
    echo    Common solutions:
    echo    1. Make sure port 3000 is not already in use
    echo    2. Try: npm run dev -- --port 3001
    echo    3. Check for any error messages above
    echo    4. Try: npm install ^&^& npm run dev
)

pause 