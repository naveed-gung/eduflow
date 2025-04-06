#!/bin/bash

# This script is specifically for building on Render

echo "🚀 Starting Render build process for EduFlow"
echo "============================================"

# Print environment for debugging
echo "Current directory: $(pwd)"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Environment variables:"
echo "NODE_ENV: $NODE_ENV"
echo "RENDER: $RENDER"
ls -la

# Set environment variables for production
export RENDER=true
export NODE_ENV=production

# Build client application
echo "📦 Building client application..."
cd client
npm install
npm run build
ls -la dist
echo "✅ Client build complete"

# Create server/public directory and copy build files
echo "📋 Copying build files to server/public..."
cd ..
mkdir -p server/public
cp -r client/dist/* server/public/ || echo "⚠️ Copy failed, will use direct path"
ls -la server/public || echo "Directory listing failed"

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install

# Run diagnostic script
echo "🔍 Running diagnostics..."
node diagnose-render.js || echo "Diagnostic script failed, but continuing deployment"
cd ..

echo "✅ Build process complete!" 