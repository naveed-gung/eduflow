require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const path = require('path');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const userRoutes = require('./routes/users');
const certificateRoutes = require('./routes/certificates');
const categoryRoutes = require('./routes/categories');
const testRoutes = require('./routes/test');
const aiRoutes = require('./routes/ai');

// Check if running in production (e.g., on Render)
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

// Initialize Express
const app = express();

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure CORS for deployment
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: true, // Allow all origins in all environments for now
  credentials: true
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/test', testRoutes);
app.use('/api/ai', aiRoutes);

// API Welcome route
app.get('/api', (req, res) => {
  res.send('Welcome to EduFlow API - Online Learning Platform');
});

// Serve frontend in production
if (isProduction) {
  console.log('Running in production mode, serving static files');
  
  // Define possible build paths in order of preference
  const possibleBuildPaths = [
    path.join(__dirname, '../public'),
    path.join(__dirname, '../../client/dist'),
    path.join(process.cwd(), 'client/dist'),
    path.join(process.cwd(), 'dist')
  ];
  
  // Find the first path that exists
  let clientBuildPath = null;
  for (const buildPath of possibleBuildPaths) {
    try {
      if (require('fs').existsSync(path.join(buildPath, 'index.html'))) {
        clientBuildPath = buildPath;
        console.log(`Found valid client build at: ${buildPath}`);
        break;
      }
    } catch (err) {
      console.log(`Path ${buildPath} not accessible: ${err.message}`);
    }
  }
  
  if (!clientBuildPath) {
    console.error('Could not find client build directory!');
    console.error('Searched paths:', possibleBuildPaths);
    clientBuildPath = path.join(__dirname, '../public'); // Fallback path
    console.log(`Using fallback path: ${clientBuildPath}`);
  }
  
  console.log('Client build path:', clientBuildPath);
  
  // Serve static files
  app.use(express.static(clientBuildPath));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res, next) => {
    // Log requested path for debugging
    console.log(`Received request for: ${req.url}`);
    
    if (req.url.startsWith('/api')) {
      console.log('API request - passing to API routes');
      return next(); // Let API routes handle API requests
    }
    
    const indexPath = path.join(clientBuildPath, 'index.html');
    console.log(`Attempting to serve: ${indexPath}`);
    
    if (require('fs').existsSync(indexPath)) {
      console.log('Found index.html, sending file');
      res.sendFile(indexPath);
    } else {
      console.error(`index.html not found at ${indexPath}`);
      // Provide a fallback HTML response
      res.send(`
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
              pre { background: #f8f8f8; padding: 1rem; border-radius: 4px; overflow-x: auto; }
            </style>
          </head>
          <body>
            <h1>EduFlow API Server</h1>
            <div class="card">
              <h2>API Status</h2>
              <p>The API server is running successfully. You can access the API at <a href="/api">/api</a></p>
              <p>However, the client build files are missing. This could be due to a build error.</p>
            </div>
            <div class="card">
              <h2>Technical Information</h2>
              <p>Attempted to serve index.html from: <pre>${indexPath}</pre></p>
              <p>Environment: ${isProduction ? 'Production' : 'Development'}</p>
              <p>Checked paths: <pre>${JSON.stringify(possibleBuildPaths, null, 2)}</pre></p>
            </div>
          </body>
        </html>
      `);
    }
  });
} else {
  // Welcome route for development
  app.get('/', (req, res) => {
    res.send('Welcome to EduFlow API - Development Mode');
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
});

// Connect to MongoDB with improved error handling and connection options
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI, {
  // Connection options for better resilience
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
  socketTimeoutMS: 45000, // How long sockets stay open idle
  maxPoolSize: 10 // Maximum number of connections in the connection pool
})
  .then(() => {
    console.log('Connected to MongoDB successfully');
    
    // Start server only after successful database connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${isProduction ? 'production' : 'development'}`);
      console.log(`API available at: ${isProduction ? '/api' : `http://localhost:${PORT}/api`}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.error('Make sure your MONGODB_URI environment variable is correct and MongoDB is running.');
    
    if (isProduction) {
      console.error('In production, check your Render environment variables.');
    } else {
      console.error('Check your .env file or start MongoDB locally.');
    }
    
    // Exit with error in production, but keep server running in development
    if (isProduction) {
      process.exit(1);
    } else {
      // Start server anyway in development, but with limited functionality
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`⚠️ Server running on port ${PORT} WITHOUT database connection`);
        console.log('API endpoints requiring database access will not work');
      });
      
      // Override routes with error message when DB is unavailable
      app.use('/api', (req, res) => {
        res.status(503).json({
          error: 'Database connection failed',
          message: 'The server cannot connect to the database. Please try again later.'
        });
      });
    }
  });
