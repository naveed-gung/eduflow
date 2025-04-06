# Deploying EduFlow to Render

This guide provides step-by-step instructions for deploying the EduFlow application to Render.com, with special attention to CORS configuration to avoid common issues.

## Prerequisites

- A Render.com account
- Your project code in a Git repository (GitHub, GitLab, etc.)
- A MongoDB Atlas database (or other MongoDB provider)

## Step 1: Configure Your CORS Settings

Before deploying, make sure your CORS settings in `server/src/index.js` are set to allow all origins in production:

```javascript
// Configure CORS for deployment
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: true, // Allow all origins in all environments for now
  credentials: true
}));
```

## Step 2: Create a New Web Service on Render

1. Log in to your Render dashboard
2. Click "New" and select "Web Service"
3. Connect your Git repository
4. Configure the following settings:
   - **Name**: `eduflow` (or your preferred name)
   - **Environment**: `Node`
   - **Branch**: `main` (or your deployment branch)
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm start`
   - **Instance Type**: Choose the appropriate plan (Free tier is fine for testing)

## Step 3: Configure Environment Variables

Add the following environment variables in your Render dashboard:

```
NODE_ENV=production
RENDER=true
PORT=10000  # Render will override this anyway
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
```

> **Important**: For `FIREBASE_PRIVATE_KEY`, make sure to include the entire key including newlines. Render supports multiline environment variables.

## Step 4: Deploy

1. Click "Create Web Service"
2. Wait for the deployment to complete
3. Once deployed, you should see the URL for your application

## Troubleshooting CORS Issues

If you encounter CORS issues after deployment:

1. **Run the Diagnostic Script**: SSH into your Render instance or use the web shell and run:
   ```
   cd /opt/render/project/src && npm run render-fix
   ```

2. **Check Render Logs**: In your Render dashboard, check the logs for any errors related to CORS or file paths.

3. **Manual Fix**: If the automatic fix doesn't work, you can manually edit the CORS configuration by accessing the web shell and modifying the file directly:
   ```
   cd /opt/render/project/src/server/src
   vi index.js
   ```
   Then set the CORS origin to `true`.

4. **Restart After Changes**: After making any changes, restart your service from the Render dashboard.

## Common Issues

1. **Missing Files**: Ensure your build process correctly copies client files to the server/public directory.

2. **Environment Variables**: Double-check all required environment variables are set correctly.

3. **CORS Headers**: If you're still facing CORS issues, ensure your API responses include proper CORS headers.

4. **MongoDB Connection**: Verify your MongoDB connection string and ensure your database is accessible from Render.

## Need More Help?

Run the diagnostic script to get detailed information about your deployment:

```
cd /opt/render/project/src/server && node diagnose-render.js
```

This will output details about your environment, file paths, and CORS configuration that can help identify the source of any issues. 