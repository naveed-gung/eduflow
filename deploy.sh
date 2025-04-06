#!/bin/bash

# Exit on error
set -e

echo "🚀 EduFlow Deployment Preparation Script"
echo "========================================"
echo

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Step 2: Build client
echo "🏗️ Building client..."
npm run build

# Step 3: Check that production configuration files exist
echo "🔍 Checking configuration files..."

if [ ! -f "./client/.env.production" ]; then
  echo "⚠️ Warning: client/.env.production not found."
  echo "Creating basic .env.production file..."
  cat > "./client/.env.production" << EOL
# API Configuration
VITE_API_URL=/api

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyDK-Avats0D5qNVsdESnpkbgLHykShsbA0
VITE_FIREBASE_AUTH_DOMAIN=eduflow-6a918.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=eduflow-6a918
VITE_FIREBASE_STORAGE_BUCKET=eduflow-6a918.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
EOL
  echo "✅ Created client/.env.production"
fi

if [ ! -f "./server/.env" ]; then
  echo "⚠️ Warning: server/.env not found."
  echo "Please create a server/.env file with your MongoDB URI and JWT secret."
  echo "Example:"
  echo "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eduflow"
  echo "JWT_SECRET=your_secure_jwt_secret"
  echo "FIREBASE_PROJECT_ID=your_firebase_project_id"
  echo "FIREBASE_CLIENT_EMAIL=your_firebase_client_email"
  echo "FIREBASE_PRIVATE_KEY=\"your_firebase_private_key\""
  exit 1
fi

# Step 4: Git checks
echo "🔄 Checking Git status..."

if ! command -v git &> /dev/null; then
  echo "❌ Git is not installed. Please install Git to proceed with deployment."
  exit 1
fi

if [ ! -d ".git" ]; then
  echo "❌ Not a Git repository. Please initialize a Git repository first."
  echo "Run the following commands:"
  echo "  git init"
  echo "  git add ."
  echo "  git commit -m \"Initial commit\""
  exit 1
fi

# Get the current branch
BRANCH=$(git branch --show-current)
echo "📌 Current branch: $BRANCH"

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "⚠️ You have uncommitted changes."
  echo "Please commit your changes before deploying:"
  echo "  git add ."
  echo "  git commit -m \"Your commit message\""
  exit 1
fi

# Step 5: Render deployment instructions
echo "🎯 Ready for Render deployment!"
echo
echo "Follow these steps to deploy to Render:"
echo "1. Push your code to GitHub:"
echo "   git push origin $BRANCH"
echo
echo "2. Sign up for Render at https://render.com"
echo
echo "3. Create a new Web Service with these settings:"
echo "   - Build Command: npm run install-all"
echo "   - Start Command: NODE_ENV=production npm start"
echo
echo "4. Add these environment variables in Render:"
echo "   - NODE_ENV: production"
echo "   - MONGODB_URI: [Your MongoDB connection string]"
echo "   - JWT_SECRET: [Your JWT secret]"
echo "   - RENDER: true"
echo "   - FIREBASE_PROJECT_ID: [Your Firebase project ID]"
echo "   - FIREBASE_CLIENT_EMAIL: [Your Firebase client email]"
echo "   - FIREBASE_PRIVATE_KEY: [Your Firebase private key]"
echo
echo "5. Deploy your application!"
echo
echo "✅ Deployment preparation complete! Your application is ready to be deployed to Render." 