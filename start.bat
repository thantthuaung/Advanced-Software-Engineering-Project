@echo off
title JCU Gym Management System

echo 🏋️‍♂️ Starting JCU Gym Management System...
echo ================================================

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Start the development server
echo 🚀 Starting development server...
echo 📱 The application will open at: http://localhost:3000
echo.
echo 🔑 Admin Login:
echo    Email: admin@my.jcu.edu.au
echo    Password: admin123
echo.
echo 💡 Press Ctrl+C to stop the server
echo ================================================

REM Start the application
npm run dev

pause 