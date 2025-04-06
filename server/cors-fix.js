/**
 * This file contains CORS configuration for Render deployment.
 * 
 * Instructions for Render deployment:
 * 
 * 1. Make sure you have the CORS middleware set to allow all origins in production:
 *    
 *    app.use(cors({
 *      origin: true,  // Allow all origins in production
 *      credentials: true
 *    }));
 * 
 * 2. Set the environment variables in your Render dashboard:
 *    - NODE_ENV=production
 *    - RENDER=true
 *    - PORT=10000 (or whatever port Render assigns)
 *    - CLIENT_URL=https://eduflow.onrender.com (or your custom domain)
 * 
 * 3. Make sure your Build Command is set to: bash ./render-build.sh
 * 
 * 4. Make sure your Start Command is set to: cd server && npm start
 */

// The CORS configuration in server/src/index.js should look like this:
/*
// Configure CORS for deployment
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  // In production, allow all origins
  // In development, be more restrictive
  origin: isProduction ? true : [clientUrl, 'https://eduflow.onrender.com', 'http://eduflow.onrender.com'],
  credentials: true
}));
*/ 