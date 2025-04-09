const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authenticate, isAdmin } = require('../middleware/auth');
const mongoose = require('mongoose');

// Get current user's profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate({
        path: 'enrolledCourses.courseId',
        select: 'title thumbnail level duration status'
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
  res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update current user's profile
router.put(
  '/profile',
  [
    authenticate,
    body('name', 'Name is required').optional().not().isEmpty(),
    body('email', 'Please include a valid email').optional().isEmail()
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      name,
      email,
      photoURL,
      bio,
      location,
      website,
      social,
      preferences
    } = req.body;
    
    try {
      // Build update object
      const updateFields = {};
      
      if (name) updateFields.name = name;
      if (photoURL) updateFields.photoURL = photoURL;
      if (bio) updateFields.bio = bio;
      if (location) updateFields.location = location;
      if (website) updateFields.website = website;
      
      // Update social links if provided
      if (social) {
        updateFields.social = {};
        if (social.linkedin) updateFields.social.linkedin = social.linkedin;
        if (social.twitter) updateFields.social.twitter = social.twitter;
        if (social.github) updateFields.social.github = social.github;
      }
      
      // Update preferences if provided
      if (preferences) {
        updateFields.preferences = {};
        if (preferences.emailNotifications !== undefined) updateFields.preferences.emailNotifications = preferences.emailNotifications;
        if (preferences.darkMode !== undefined) updateFields.preferences.darkMode = preferences.darkMode;
        if (preferences.language) updateFields.preferences.language = preferences.language;
      }
      
      // Check if email update is requested
      if (email && email !== req.user.email) {
        // Check if email is already in use
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: 'Email already in use' });
        }
        
        updateFields.email = email;
      }
      
      // Update user
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updateFields },
        { new: true }
      ).select('-password');
      
  res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Change password
router.put(
  '/change-password',
  [
    authenticate,
    body('currentPassword', 'Current password is required').not().isEmpty(),
    body('newPassword', 'New password must be 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    try {
      // Get user
      const user = await User.findById(req.user.id);
      
      // Check if user used OAuth
      if (user.authProvider !== 'email') {
        return res.status(400).json({ 
          message: `This account uses ${user.authProvider} login. Password change is not available.` 
        });
      }
      
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      
      await user.save();
      
      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get user's enrolled courses
router.get('/enrolled-courses', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('enrolledCourses')
      .populate({
        path: 'enrolledCourses.courseId',
        select: 'title description thumbnail level duration instructorName studentsCount rating'
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
  res.status(200).json({
    success: true,
      enrolledCourses: user.enrolledCourses
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload user avatar
router.put('/avatar', authenticate, async (req, res) => {
  try {
    const { avatar } = req.body;
    
    if (!avatar) {
      return res.status(400).json({ message: 'Avatar image is required' });
    }
    
    // Find user and update avatar
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { photoURL: avatar } },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      user
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user avatar
router.delete('/avatar', authenticate, async (req, res) => {
  try {
    // Find user and set photoURL to null
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { photoURL: null } },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Avatar removed successfully',
      user
    });
  } catch (error) {
    console.error('Remove avatar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's dashboard statistics
router.get('/dashboard-stats', authenticate, async (req, res) => {
  try {
    // Fetch user with enrolled courses and certificates
    const user = await User.findById(req.user.id)
      .select('enrolledCourses certificates')
      .populate({
        path: 'enrolledCourses.courseId',
        select: 'title level'
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate stats based on user data
    const enrolledCount = user.enrolledCourses.length;
    
    // Count completed courses (progress >= 90%)
    const completedCount = user.enrolledCourses.filter(course => course.progress >= 90).length;
    
    // Count certificates
    const certificatesCount = user.certificates?.length || 0;
    
    // Calculate average score across all quizzes
    const allQuizResults = user.enrolledCourses.flatMap(course => course.quizResults || []);
    let averageScore = 0;
    
    if (allQuizResults.length > 0) {
      const totalScore = allQuizResults.reduce((total, quiz) => {
        const quizPercentage = quiz.score / quiz.totalQuestions * 100;
        return total + quizPercentage;
      }, 0);
      
      averageScore = Math.round(totalScore / allQuizResults.length);
    }
    
    // Generate weekly learning activity (mock data for now)
    // In a real implementation, this would be calculated from actual user activity logs
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyLearningActivity = weekDays.map(day => {
      // Generate a random learning time between 0-3 hours
      // This should be replaced with actual user activity tracking
      return {
        name: day,
        hours: parseFloat((Math.random() * 3).toFixed(1))
      };
    });
    
    // Calculate total learning time from weekly data
    const totalLearningTime = parseFloat(weeklyLearningActivity
      .reduce((total, day) => total + day.hours, 0)
      .toFixed(1));
    
    // Get course progress for chart display
    // Take up to 4 courses for the chart
    const courseProgress = user.enrolledCourses
      .slice(0, 4)
      .map(course => ({
        name: course.courseId.title.length > 15 
          ? course.courseId.title.substring(0, 15) + '...' 
          : course.courseId.title,
        value: course.progress || 0
      }));
    
    res.status(200).json({
      success: true,
      stats: {
        enrolledCount,
        completedCount,
        certificatesCount,
        averageScore,
        weeklyLearningActivity,
        totalLearningTime,
        courseProgress
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admin dashboard statistics
router.get('/admin/dashboard-stats', [authenticate, isAdmin], async (req, res) => {
  try {
    // Get count of all users
    const totalStudents = await User.countDocuments({ role: 'student' });
    
    // Get courses data
    const Course = mongoose.model('Course');
    const activeCourses = await Course.countDocuments({ status: 'published' });
    
    // Calculate average completion rate
    const users = await User.find({ role: 'student' }).select('enrolledCourses');
    let completionRateSum = 0;
    let enrollmentCount = 0;
    
    users.forEach(user => {
      user.enrolledCourses.forEach(course => {
        completionRateSum += course.progress || 0;
        enrollmentCount++;
      });
    });
    
    const avgCompletionRate = enrollmentCount > 0 
      ? Math.round(completionRateSum / enrollmentCount) 
      : 0;
    
    // Get category distribution
    const courses = await Course.find().select('category');
    const categoryMap = {};
    
    courses.forEach(course => {
      if (course.category) {
        if (categoryMap[course.category]) {
          categoryMap[course.category]++;
        } else {
          categoryMap[course.category] = 1;
        }
      }
    });
    
    const categoryDistribution = Object.keys(categoryMap).map(category => ({
      name: category,
      value: categoryMap[category]
    }));
    
    // Get course performance (top 5 courses)
    const coursePerformance = await Course.aggregate([
      { $match: { status: 'published' } },
      { $sort: { studentsCount: -1 } },
      { $limit: 5 },
      {
        $project: {
          name: { $substr: ["$title", 0, 8] },
          students: { $ifNull: ["$studentsCount", 0] },
          completion: { $ifNull: ["$averageCompletion", 70] } // Mock data for demo
        }
      }
    ]);
    
    // Mock total revenue for demo
    const totalRevenue = 28750;
    
    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        activeCourses,
        avgCompletionRate,
        totalRevenue,
        coursePerformance,
        categoryDistribution
      }
    });
  } catch (error) {
    console.error('Get admin dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent students (admin only)
router.get('/recent-students', [authenticate, isAdmin], async (req, res) => {
  try {
    // Get recent students (last 5 who joined)
    const recentUsers = await User.find({ role: 'student' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email photoURL createdAt enrolledCourses');
    
    // Get total count of students
    const totalCount = await User.countDocuments({ role: 'student' });
    
    // Format the response
    const students = recentUsers.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
      date: user.createdAt.toISOString().split('T')[0],
      courses: user.enrolledCourses ? user.enrolledCourses.length : 0,
      progress: 0 // Placeholder - would need to calculate average progress
    }));
    
    res.status(200).json({
      success: true,
      students,
      totalCount
    });
  } catch (error) {
    console.error('Get recent students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student dashboard statistics
router.get('/student/dashboard-stats', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user data with enrolled courses
    const user = await User.findById(userId)
      .populate({
        path: 'enrolledCourses.courseId',
        select: 'title thumbnail level duration'
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate stats
    const enrolledCount = user.enrolledCourses.length;
    const completedCourses = user.enrolledCourses.filter(course => course.progress === 100);
    const completedCount = completedCourses.length;
    
    // Calculate average progress across all courses
    const totalProgress = user.enrolledCourses.reduce((sum, course) => sum + course.progress, 0);
    const averageProgress = enrolledCount > 0 ? Math.round(totalProgress / enrolledCount) : 0;
    
    // Calculate total learning time (this would be more accurate with actual tracking)
    // For now, we'll estimate based on course durations and progress
    let totalLearningTime = 0;
    user.enrolledCourses.forEach(course => {
      // Extract hours from duration strings like "6 weeks" or "10 hours"
      const durationMatch = course.courseId?.duration?.match(/(\d+)\s*(hour|hr|hrs|week|wk|day)/i);
      if (durationMatch) {
        const value = parseInt(durationMatch[1]);
        const unit = durationMatch[2].toLowerCase();
        
        let hours = 0;
        if (unit.includes('hour') || unit.includes('hr')) {
          hours = value;
        } else if (unit.includes('day')) {
          hours = value * 8; // assume 8 hours per day
        } else if (unit.includes('week') || unit.includes('wk')) {
          hours = value * 40; // assume 40 hours per week
        }
        
        // Apply progress percentage to get actual hours spent
        totalLearningTime += Math.round((hours * course.progress) / 100);
      }
    });
    
    // Find last accessed course
    let lastAccessedCourse = null;
    if (enrolledCount > 0) {
      const sortedCourses = [...user.enrolledCourses].sort((a, b) => 
        new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
      );
      
      if (sortedCourses.length > 0) {
        lastAccessedCourse = {
          id: sortedCourses[0].courseId._id,
          title: sortedCourses[0].courseId.title,
          progress: sortedCourses[0].progress,
          lastAccessed: sortedCourses[0].lastAccessed
        };
      }
    }
    
    res.status(200).json({
      success: true,
      stats: {
        enrolledCourses: enrolledCount,
        completedCourses: completedCount,
        certificatesEarned: user.certificates?.length || 0,
        averageProgress,
        totalLearningTime,
        lastAccessedCourse
      }
    });
  } catch (error) {
    console.error('Get student dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user preferences
router.put('/preferences', authenticate, async (req, res) => {
  try {
    const { preferences } = req.body;
    
    if (!preferences) {
      return res.status(400).json({ message: 'Preferences are required' });
    }
    
    // Find user and update preferences
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { preferences } },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      user
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ADMIN ROUTES

// Get all users (admin only)
router.get('/', [authenticate, isAdmin], async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    
    // Build query
    const query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Count total documents matching query
    const totalCount = await User.countDocuments(query);
    
    // Paginate results
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('name email role photoURL createdAt');
    
  res.status(200).json({
    success: true,
      count: users.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single user by ID (admin only)
router.get('/:id', [authenticate, isAdmin], async (req, res) => {
  try {
    console.log(`Fetching user with ID: ${req.params.id}`);
    
    const user = await User.findById(req.params.id)
      .select('-password') // Exclude password but keep all other fields including photoURL
      .populate({
        path: 'enrolledCourses.courseId',
        select: 'title thumbnail'
      });
    
    if (!user) {
      console.log(`User with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`User found: ${user.name}, ID: ${user._id}, Role: ${user.role}`);
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error details:', {
      id: req.params.id,
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack
    });
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user by ID (admin only)
router.put('/:id', [authenticate, isAdmin], async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Admin can update role
    if (req.body.role && ['student', 'instructor', 'admin'].includes(req.body.role)) {
      user.role = req.body.role;
    }
    
    // Admin can verify user
    if (req.body.isVerified !== undefined) {
      user.isVerified = req.body.isVerified;
    }
    
    await user.save();
    
  res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user by ID (admin only)
router.delete('/:id', [authenticate, isAdmin], async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting self
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    await User.deleteOne({ _id: req.params.id });
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Settings (admin only)
router.put('/admin/settings', [authenticate, isAdmin], async (req, res) => {
  try {
    const { maintenanceMode, allowRegistration, apiAccess, emailVerification } = req.body;
    
    // In a real implementation, these would update system-wide configuration
    // For demo purposes, we'll just return success
    
    res.status(200).json({
      success: true,
      message: 'Admin settings updated successfully',
      settings: {
        maintenanceMode,
        allowRegistration,
        apiAccess,
        emailVerification
      }
    });
  } catch (error) {
    console.error('Update admin settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Platform Customization (admin only)
router.put('/admin/platform-customization', [authenticate, isAdmin], async (req, res) => {
  try {
    const { platformName } = req.body;
    
    // In a real implementation, this would update system-wide configuration
    // For demo purposes, we'll just return success
    
    res.status(200).json({
      success: true,
      message: 'Platform customization updated successfully',
      customization: {
        platformName
      }
    });
  } catch (error) {
    console.error('Update platform customization error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
