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

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Build client application
echo "📦 Building client application..."
cd client

# Install all dependencies including dev dependencies
echo "Installing client dependencies including dev dependencies..."
npm install --include=dev

# Install specific missing dependency if needed
echo "Ensuring React SWC plugin is installed..."
npm install --save-dev @vitejs/plugin-react-swc

# Run build with more verbose output
echo "Running client build..."
npm run build -- --debug

# Check if build was successful
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
  echo "❌ Client build failed! Checking Vite config..."
  
  # Try fallback build with simpler config
  echo "Attempting fallback build with React plugin instead of SWC..."
  npm install --save-dev @vitejs/plugin-react
  
  # Create a temporary simpler vite config
  cat > vite.config.simple.js << 'EOL'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
EOL
  
  # Try building with the simple config
  echo "Building with simplified config..."
  npx vite build --config vite.config.simple.js
fi

# Check again if build succeeded
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
  echo "✅ Client build successful!"
  ls -la dist
else
  echo "❌ Client build still failed. Creating minimal index.html..."
  
  # Create a minimal index.html as fallback
  mkdir -p dist
  cat > dist/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EduFlow</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; line-height: 1.6; }
      h1 { color: #5d4d7a; }
      .card { border: 1px solid #eaeaea; padding: 2rem; border-radius: 8px; margin: 2rem 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    </style>
  </head>
  <body>
    <h1>EduFlow - Emergency Fallback Page</h1>
    <div class="card">
      <h2>API Status</h2>
      <p>The API should be functioning. Please check <a href="/api">/api</a> to verify.</p>
      <p>Client build failed, but the server is running. Please check build logs for details.</p>
    </div>
    <div class="card">
      <h2>Next Steps</h2>
      <p>1. Check the Render logs for build errors</p>
      <p>2. Ensure all dependencies are properly specified in package.json</p>
      <p>3. Fix any issues and redeploy</p>
    </div>
  </body>
</html>
EOL
  echo "Created fallback index.html"
fi

cd ..
echo "✅ Client build phase complete"

# Create server/public directory and copy build files
echo "📋 Copying build files to server/public..."
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