#!/bin/bash

# This script helps with redeploying on Render by forcing a rebuild

echo "🔄 Preparing EduFlow for redeployment on Render..."

# Create a dummy commit to trigger Render's auto-deploy
echo "// Render redeploy trigger - $(date)" > render-trigger.txt

# Add and commit the changes
git add render-trigger.txt
git commit -m "Trigger Render redeploy - $(date)"

# Push to the repository
echo "🚀 Pushing changes to trigger Render redeploy..."
git push

echo "✅ Redeployment triggered! Check your Render dashboard for status updates."
echo "   Your app should rebuild and deploy in a few minutes." 