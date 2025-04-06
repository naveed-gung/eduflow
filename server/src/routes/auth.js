const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const admin = require('firebase-admin');
const { authenticate } = require('../middleware/auth');

// Register a new user
router.post(
  '/register',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user
      user = new User({
        name,
        email,
        password,
        authProvider: 'email'
      });

      // Hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // Save user to database
      await user.save();

      // Create JWT payload
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      // Sign and return JWT
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
          if (err) throw err;
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              photoURL: user.photoURL
            }
          });
        }
      );
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Login user
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists()
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, rememberMe } = req.body;

    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check if user used OAuth
      if (user.authProvider !== 'email') {
        return res.status(400).json({ 
          message: `This account uses ${user.authProvider} login. Please sign in with ${user.authProvider}.` 
        });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create JWT payload
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      // Set token expiration based on rememberMe option
      const expiresIn = rememberMe ? '30d' : '1d'; // 30 days or 1 day

      // Sign and return JWT
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            expiresIn,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              photoURL: user.photoURL,
              preferences: user.preferences || {}
            }
          });
        }
      );
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Login or register with Google
router.post('/google', async (req, res) => {
  try {
    const { idToken, rememberMe } = req.body;
    
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    if (!decodedToken) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }
    
    // Get user data from decoded token
    const { uid, email, name, picture } = decodedToken;
    
    // Check if user exists in our database
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user if not found
      user = new User({
        name: name || 'Google User',
        email,
        firebaseUid: uid,
        photoURL: picture || '',
        authProvider: 'google'
      });
      
      await user.save();
    } else {
      // Update existing user's Firebase UID if they signed up with email first
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        user.authProvider = 'google';
        if (picture) user.photoURL = picture;
        await user.save();
      }
    }
    
    // Create JWT payload
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    // Set token expiration based on rememberMe option
    const expiresIn = rememberMe ? '30d' : '1d'; // 30 days or 1 day
    
    // Sign and return JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({
          success: true,
          message: 'Google login successful',
          token,
          expiresIn,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            photoURL: user.photoURL,
            preferences: user.preferences || {}
          }
        });
      }
    );
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot password - send reset email
router.post(
  '/forgot-password',
  [body('email', 'Please include a valid email').isEmail()],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        // For security, still return success even if user doesn't exist
        return res.status(200).json({
          success: true,
          message: 'If an account with that email exists, we have sent a password reset link'
        });
      }

      // Check if user used OAuth
      if (user.authProvider !== 'email') {
        return res.status(400).json({ 
          message: `This account uses ${user.authProvider} login. Password reset is not available.` 
        });
      }

      // In a real application, generate a reset token and send email
      // For now, we'll just return success
  res.status(200).json({
    success: true,
    message: 'Password reset email sent'
  });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Reset password
router.post(
  '/reset-password',
  [
    body('token', 'Token is required').not().isEmpty(),
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // In a real application, verify token and update password
    // For now, we'll just return success
  res.status(200).json({
    success: true,
    message: 'Password reset successful'
  });
  }
);

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    // Get user data (already attached to request by authenticate middleware)
    const user = req.user;
    
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoURL: user.photoURL,
        enrolledCourses: user.enrolledCourses,
        certificates: user.certificates
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
