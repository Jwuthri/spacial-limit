@echo off
REM Spatial Understanding - Windows Startup Script
REM This script starts both the Python backend and Next.js frontend

echo [INFO] Starting Spatial Understanding Application
echo.

REM Check prerequisites
echo [INFO] Checking prerequisites...

where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not installed. Please install Python 3.8+ and try again.
    pause
    exit /b 1
)

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not installed. Please install npm and try again.
    pause
    exit /b 1
)

echo [SUCCESS] All prerequisites found
echo.

REM Setup backend
echo [INFO] Setting up backend...
cd backend

REM Check for .env file
if not exist ".env" (
    if exist ".env.example" (
        echo [WARNING] No .env file found. Copying from .env.example...
        copy ".env.example" ".env"
        echo [WARNING] Please edit backend\.env and add your GEMINI_API_KEY
        echo [WARNING] You can get an API key from: https://aistudio.google.com/app/apikey
        pause
    ) else (
        echo [ERROR] No .env file found and no .env.example to copy from.
        pause
        exit /b 1
    )
)

REM Install Python dependencies
echo [INFO] Installing Python dependencies...
pip install --upgrade -r requirements.txt

REM Start backend
echo [INFO] Starting backend server on port 8000...
start "Backend Server" python main.py

cd ..

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Setup frontend
echo [INFO] Setting up frontend...
cd frontend

REM Install Node.js dependencies
echo [INFO] Installing Node.js dependencies...
npm install

REM Create .env.local if it doesn't exist
if not exist ".env.local" (
    echo [INFO] Creating frontend .env.local file...
    echo BACKEND_URL=http://localhost:8000 > .env.local
)

REM Start frontend
echo [INFO] Starting frontend server on port 3000...
start "Frontend Server" npm run dev

cd ..

echo.
echo [SUCCESS] Application started successfully!
echo.
echo Services running:
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo   API Docs: http://localhost:8000/docs
echo.
echo Press any key to open the application in your browser...
pause >nul

start http://localhost:3000 