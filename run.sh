#!/bin/bash

# Spatial Understanding - Startup Script
# This script starts both the Python backend and Next.js frontend

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -i:$1 >/dev/null 2>&1
}

# Function to cleanup background processes on exit
cleanup() {
    print_status "Shutting down services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        print_status "Backend stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        print_status "Frontend stopped"
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

print_status "🚀 Starting Spatial Understanding Application"
echo

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists python3; then
    print_error "Python 3 is not installed. Please install Python 3.8+ and try again."
    exit 1
fi

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

print_success "All prerequisites found"
echo

# Check if ports are available
if port_in_use 8000; then
    print_warning "Port 8000 is already in use. The backend might already be running."
fi

if port_in_use 3000; then
    print_warning "Port 3000 is already in use. The frontend might already be running."
fi

# Setup backend
print_status "Setting up backend..."
cd backend

# Check if virtual environment should be used
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if requirements.txt is newer than last install
if [ ! -f ".last_install" ] || [ "requirements.txt" -nt ".last_install" ]; then
    print_status "Installing Python dependencies..."
    pip install --upgrade -r requirements.txt
    touch .last_install
else
    print_status "Python dependencies are up to date"
fi

# Check for .env file
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        print_warning "No .env file found. Copying from .env.example..."
        cp .env.example .env
        print_warning "Please edit backend/.env and add your GEMINI_API_KEY before continuing."
        print_warning "You can get an API key from: https://aistudio.google.com/app/apikey"
        read -p "Press Enter after you've added your API key to continue..."
    else
        print_error "No .env file found and no .env.example to copy from."
        exit 1
    fi
fi

# Check if GEMINI_API_KEY is set
if ! grep -q "^GEMINI_API_KEY=..*" .env; then
    print_error "GEMINI_API_KEY is not set in backend/.env file."
    print_error "Please add your Gemini API key to the .env file."
    print_error "Get your API key from: https://aistudio.google.com/app/apikey"
    exit 1
fi

print_status "Starting backend server on port 8000..."
python main.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Setup frontend
print_status "Setting up frontend..."
cd frontend

# Install dependencies if package.json is newer than node_modules
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    print_status "Installing Node.js dependencies..."
    npm install
else
    print_status "Node.js dependencies are up to date"
fi

# Check for .env.local file
if [ ! -f ".env.local" ]; then
    print_status "Creating frontend .env.local file..."
    echo "BACKEND_URL=http://localhost:8000" > .env.local
fi

print_status "Starting frontend server on port 3000..."
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for services to start
print_status "Waiting for services to start..."
sleep 3

# Check if services are running
if ! port_in_use 8000; then
    print_error "Backend failed to start on port 8000"
    cleanup
    exit 1
fi

if ! port_in_use 3000; then
    print_error "Frontend failed to start on port 3000"
    cleanup
    exit 1
fi

print_success "🎉 Application started successfully!"
echo
print_status "Services running:"
print_status "  🐍 Backend:  http://localhost:8000"
print_status "  🌐 Frontend: http://localhost:3000"
print_status "  📚 API Docs: http://localhost:8000/docs"
echo
print_status "Press Ctrl+C to stop all services"
echo

# Keep the script running and wait for background processes
wait 