const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const User = require('../models/User');

// Middleware to verify JWT token
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Log authentication attempt
    console.log(`Authentication attempt for: ${req.originalUrl}`, { 
      hasAuthHeader: !!authHeader,
      method: req.method
    });
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Authentication failed: No Bearer token provided');
      return res.status(401).json({ message: 'Authentication token is required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log('Authentication failed: Empty token');
      return res.status(401).json({ message: 'Invalid token format' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded || !decoded.id) {
      console.log('Authentication failed: Invalid token payload');
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Find user by id
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log(`Authentication failed: User not found (ID: ${decoded.id})`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Authentication successful
    console.log(`Authentication successful for user: ${user.email} (${user.id})`);
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    return res.status(401).json({ message: 'Not authorized, authentication failed' });
  }
};

// Middleware to verify Firebase token
exports.authenticateFirebase = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication token is required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify the Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    if (!decodedToken) {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
    
    // Find or create user based on Firebase UID
    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user) {
      user = new User({
        name: decodedToken.name || 'Firebase User',
        email: decodedToken.email,
        firebaseUid: decodedToken.uid,
        photoURL: decodedToken.picture || '',
        authProvider: 'google'
      });
      await user.save();
    }
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Firebase auth middleware error:', error);
    return res.status(401).json({ message: 'Not authorized, firebase token failed' });
  }
};

// Middleware for admin access
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized as an admin' });
  }
}; 