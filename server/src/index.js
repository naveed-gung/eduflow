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
  origin: [clientUrl, 'https://eduflow.onrender.com'],
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
        break;
      }
    } catch (err) {
      console.log(`Path ${buildPath} not accessible`);
    }
  }
  
  if (!clientBuildPath) {
    console.error('Could not find client build directory!');
    console.error('Searched paths:', possibleBuildPaths);
    clientBuildPath = path.join(__dirname, '../public'); // Fallback path
  }
  
  console.log('Client build path:', clientBuildPath);
  
  // Serve static files
  app.use(express.static(clientBuildPath));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) {
      return next(); // Let API routes handle API requests
    }
    
    const indexPath = path.join(clientBuildPath, 'index.html');
    console.log(`Attempting to serve: ${indexPath}`);
    
    if (require('fs').existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Client application not found. Please check build configuration.');
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
