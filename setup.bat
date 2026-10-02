@echo off
echo ==================================================
echo   Event Management System - FRCRCE
echo   Setup ^& Installation Script
echo ==================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version: 
node --version

REM Check if MongoDB is installed
where mongod >nul 2>nul
if %errorlevel% neq 0 (
    echo WARNING: MongoDB is not installed or not in PATH
    echo Please install MongoDB from https://www.mongodb.com/try/download/community
    echo.
)

echo.
echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully!
echo.
echo Database Setup
echo Make sure MongoDB is running before proceeding
echo.

set /p mongo_running="Is MongoDB running? (y/n): "

if /i not "%mongo_running%"=="y" (
    echo.
    echo Please start MongoDB first:
    echo   - Windows Service: net start MongoDB
    echo   - Manual: Run mongod.exe
    echo   - Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest
    echo.
    pause
    exit /b 0
)

echo.
set /p seed_db="Would you like to seed the database with test data? (y/n): "

if /i "%seed_db%"=="y" (
    echo Seeding database...
    node seedData.js
)

echo.
echo ==================================================
echo   Setup Complete!
echo ==================================================
echo.
echo To start the server:
echo   - Development mode: npm run dev
echo   - Production mode: npm start
echo.
echo Server will be available at: http://localhost:3000
echo.
echo Test Credentials:
echo   Admin:   admin@frcrce.ac.in / admin123
echo   Faculty: faculty@frcrce.ac.in / faculty123
echo   Student: student@frcrce.ac.in / student123
echo.
echo ==================================================
pause
