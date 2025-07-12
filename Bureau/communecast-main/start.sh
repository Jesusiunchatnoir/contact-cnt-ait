#!/bin/bash

# CommuneCast - Start Script
# Libre • Égalité • Fraternité

set -e

echo "🏴 Starting CommuneCast - Encrypted Video Conferencing"
echo "🔒 For the people, by the people"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo "✅ npm $(npm -v) detected"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Build the application if .next doesn't exist
if [ ! -d ".next" ]; then
    echo "🔨 Building application..."
    npm run build
    echo "✅ Application built"
else
    echo "✅ Application already built"
fi

# Set default port if not specified
PORT=${PORT:-3000}
DOMAIN=${DOMAIN:-localhost}

echo ""
echo "🚀 Starting CommuneCast server..."
echo "📡 Server will be available at: http://$DOMAIN:$PORT"
echo "🔗 Share this link with comrades to join rooms"
echo ""
echo "To stop the server, press Ctrl+C"
echo ""

# Set environment variables and start
export NODE_ENV=production
export PORT=$PORT
export DOMAIN=$DOMAIN

# Start the server
npm start