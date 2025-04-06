const express = require('express');
const router = express.Router();

/**
 * @route GET /api/test/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * @route GET /api/test/error
 * @desc Test error handling
 * @access Public
 */
router.get('/error', (req, res, next) => {
  try {
    // Throw a test error
    throw new Error('This is a test error');
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/test/info
 * @desc Get server information
 * @access Public
 */
router.get('/info', (req, res) => {
  res.status(200).json({
    success: true,
    info: {
      name: 'EduFlow API',
      version: '1.0.0',
      node: process.version,
      platform: process.platform,
      uptime: Math.floor(process.uptime()) + ' seconds'
    }
  });
});

module.exports = router; 