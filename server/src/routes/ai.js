const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');

// Simple in-memory storage for conversation context
// In a production environment, this would be stored in a database
const userContexts = new Map();

// Helper function to generate simple responses
const generateResponse = async (message, userId) => {
  message = message.toLowerCase();
  
  // Get user context or create a new one
  let context = userContexts.get(userId) || { lastInteraction: Date.now(), topics: [] };
  
  // Update context with current interaction
  context.lastInteraction = Date.now();
  
  // Add the current message topic to the context
  if (message.includes('course')) context.topics.push('courses');
  if (message.includes('certificate')) context.topics.push('certificates');
  if (message.includes('enroll')) context.topics.push('enrollment');
  if (message.includes('payment') || message.includes('price')) context.topics.push('payment');
  if (message.includes('tech') || message.includes('problem')) context.topics.push('technical');
  
  // Store updated context
  userContexts.set(userId, context);
  
  // Try to fetch user data for personalized responses
  let userData = null;
  let courses = [];
  try {
    userData = await User.findById(userId).select('-password');
    courses = await Course.find().limit(5);
  } catch (error) {
    console.error('Error fetching data for AI response:', error);
  }
  
  // Course-related queries
  if (message.includes('popular course') || message.includes('best course')) {
    return `Here are some of our popular courses: ${
      courses.length > 0 
        ? courses.map(c => c.title).join(', ') 
        : "Advanced JavaScript, Machine Learning Fundamentals, UX Design Principles, Data Science with Python, and Mobile App Development"
    }. Would you like more information about any of these?`;
  }
  
  if (message.includes('beginner') || message.includes('start')) {
    return `For beginners, I recommend starting with foundational courses like ${
      courses.filter(c => c.level === 'beginner').length > 0
        ? courses.filter(c => c.level === 'beginner').map(c => c.title).join(', ')
        : "Programming Basics, Web Development Foundations, or Design Principles"
    }. These will give you a solid foundation before moving to more advanced topics.`;
  }
  
  if (message.includes('certificate')) {
    return "To earn a certificate, you need to complete all course modules and pass the final assessment with a score of at least 70%. Certificates can be downloaded directly from your profile once earned and are shareable on LinkedIn and other platforms.";
  }
  
  if (message.includes('price') || message.includes('cost') || message.includes('subscription')) {
    return "We offer several pricing options: monthly subscription at $29.99/month, annual subscription at $199/year (saving over 44%), or individual course purchases ranging from $19.99 to $99.99 depending on the course depth and specialization level.";
  }
  
  if (message.includes('technical') || message.includes('support') || message.includes('help') || message.includes('problem')) {
    return "For technical support, please describe your issue in detail. You can also reach our support team at support@eduflow.com or through the Help Center accessible from your dashboard.";
  }
  
  if (message.includes('profile') || message.includes('account')) {
    if (userData) {
      return `Your profile shows you're registered as ${userData.name} with email ${userData.email}. You can update your profile information including your profile picture in the Settings section.`;
    } else {
      return "You can manage your profile settings including personal information, notification preferences, and security settings from your account dashboard.";
    }
  }
  
  if (message.includes('my courses') || message.includes('enrolled')) {
    if (userData && userData.courses && userData.courses.length > 0) {
      return `You're currently enrolled in ${userData.courses.length} courses. You can access them from your student dashboard.`;
    } else {
      return "You're not currently enrolled in any courses. Browse our course catalog to find something that interests you!";
    }
  }
  
  // Default responses based on context
  const defaultResponses = [
    `How can I help you with your learning journey today${userData ? ', ' + userData.name : ''}?`,
    "Is there a specific course topic you're interested in learning more about?",
    "Do you have any questions about your current courses or enrollment process?",
    "I'm here to help with any questions about courses, certifications, or your account.",
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

// Chat endpoint - requires authentication
router.post('/chat', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    
    if (!message) {
      return res.status(400).json({ message: 'No message provided' });
    }
    
    // Generate a response
    const response = await generateResponse(message, userId);
    
    res.status(200).json({ message: response });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get conversation history - requires authentication
router.get('/chat/history', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const context = userContexts.get(userId);
    
    if (!context) {
      return res.status(200).json({ 
        history: [],
        message: 'No conversation history found' 
      });
    }
    
    res.status(200).json({ 
      context,
      message: 'Conversation context retrieved successfully' 
    });
  } catch (error) {
    console.error('AI history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear conversation history - requires authentication
router.delete('/chat/history', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    userContexts.delete(userId);
    
    res.status(200).json({ message: 'Conversation history cleared successfully' });
  } catch (error) {
    console.error('AI history clear error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 