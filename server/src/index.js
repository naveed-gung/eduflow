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
  // Serve static files from the client's build directory
  const clientBuildPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuildPath));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) {
      return next(); // Let API routes handle API requests
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${isProduction ? 'production' : 'development'}`);
});
