#!/bin/bash

# Exit on error
set -e

echo "🚀 EduFlow Render Deployment Script"
echo "=================================="
echo

# Environment detection
export RENDER=true
export NODE_ENV=production
echo "🔍 Running in production mode (Render)"

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# Step 2: Build client
echo "🏗️ Building client..."
cd client && npm run build && cd ..

# Step 3: Copy client build to server public directory
echo "📋 Copying client build files to server/public directory..."
mkdir -p server/public
cp -r client/dist/* server/public/
echo "✅ Client build copied to server/public"

# Step 4: Check for CORS issues
echo "🔧 Setting up CORS for production..."
sed -i 's/const isProduction = process.env.NODE_ENV === '\''production'\'' || process.env.RENDER === '\''true'\'';/const isProduction = true;/' server/src/index.js
echo "✅ CORS configured for production"

# Step 5: Start the server
echo "🚀 Starting EduFlow server..."
cd server && npm start 