# EduFlow API Connection Issues Fix Guide

This document provides a comprehensive guide to fix API connection issues within the EduFlow application, particularly focusing on problems encountered after deploying to Render.

## Common Issues

The most common errors you might see are:

- `Error fetching dashboard stats: Network Error`
- `ERR_CONNECTION_REFUSED` when accessing API endpoints
- Pages loading but showing no data
- `GET http://localhost:5000/api/courses?page=1&limit=9 net::ERR_CONNECTION_REFUSED`

These errors typically occur because the client code is still trying to connect to `http://localhost:5000/api` instead of using the relative `/api` path in the production environment.

## Fixes Applied

We've made the following important fixes to the codebase:

1. **Centralized API Configuration**
   - Updated `client/src/lib/api.ts` to better detect the environment and use the appropriate API URL
   - Added improved error handling and debugging

2. **Replaced Hardcoded API URLs**
   - Fixed all components that were using hardcoded `http://localhost:5000/api` URLs:
     - `StudentDashboard.tsx`
     - `SettingsPage.tsx`
     - `ProfilePage.tsx`
     - `CourseDetailPage.tsx`
     - `CertificateVerifierPage.tsx`
     - `AdminDashboard.tsx`
     - `AdminCertificatesPage.tsx`
     - `DashboardStats.tsx`
     - `CourseForm.tsx`
     - `AIAssistant.tsx`

3. **Environment Configuration**
   - Ensured `.env.production` is correctly configured with `VITE_API_URL=/api`

## Testing Your Fix

After applying these fixes, you should test both in development and production environments:

### Development Testing

1. Start both the client and server:
   ```bash
   npm run dev
   ```

2. Open the browser console and verify:
   - The console logs show `API Base URL: http://localhost:5000/api`
   - API requests are going to the correct URL

### Production Testing

1. Build for production:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

3. Open your app and verify in the browser console:
   - The console logs show `API Base URL: /api`
   - API requests are going to relative paths

## Troubleshooting After Deployment

If you still encounter issues after deploying to Render:

1. **Clear Browser State**
   - Run this in your browser console:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   location.reload(true);
   ```

2. **Check Network Requests**
   - Open Developer Tools > Network tab
   - Filter for "api" to see API requests
   - Check that requests are going to `/api/` and not `http://localhost:5000/api/`

3. **Verify Server Logs**
   - Check Render logs for any server-side errors
   - Ensure MongoDB connection is successful

4. **Run Diagnostic Script**
   - On your local machine:
   ```bash
   node diagnose-connection.js
   ```

5. **Force Rebuild on Render**
   - You can trigger a new build by running:
   ```bash
   ./render-restart.sh
   ```

## Prevention Measures

To prevent these issues in the future:

1. **Always use the centralized API client**
   ```typescript
   import api from '@/lib/api';
   
   // Good:
   const response = await api.get('/courses');
   
   // Bad:
   const response = await axios.get('http://localhost:5000/api/courses');
   ```

2. **Test production builds locally before deploying**
   ```bash
   npm run build
   npm start
   ```

3. **Check the browser console for API URL logs during startup**

Feel free to use the reset script provided in `reset-app-state.js` if you continue to have client-side caching issues. 