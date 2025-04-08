const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');
const Category = require('../models/Category');
const { authenticate, isAdmin } = require('../middleware/auth');

// Get all published courses
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      level, 
      search, 
      limit = 9, // Default to 9 courses per page for the UI
      page = 1 
    } = req.query;
    
    // Build query
    const query = { status: 'Published' };
    
    if (category) {
      query.categoryId = category;
    }
    
    if (level) {
      query.level = level;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { instructorName: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Count total documents matching query
    const totalCount = await Course.countDocuments(query);
    
    // Calculate pagination values
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const skip = (parsedPage - 1) * parsedLimit;
    
    // Paginate results
    const courses = await Course.find(query)
      .populate('instructor', 'name photoURL')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .select('title description thumbnail instructorName level duration studentsCount rating createdAt');

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / parsedLimit);

    res.status(200).json({
      success: true,
      count: courses.length,
      totalCount,
      totalPages,
      currentPage: parsedPage,
      courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all courses for admin
router.get('/admin', [authenticate, isAdmin], async (req, res) => {
  try {
    const { 
      search, 
      status, 
      category,
      limit = 10, 
      page = 1 
    } = req.query;
    
    // Build query - admins can see all courses regardless of status
    const query = {};
    
    if (status && status !== 'All') {
      query.status = status;
    }
    
    if (category) {
      query.categoryId = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { instructorName: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Count total documents matching query
    const totalCount = await Course.countDocuments(query);
    
    // Calculate pagination values
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const skip = (parsedPage - 1) * parsedLimit;
    
    // Paginate results
    const courses = await Course.find(query)
      .populate('instructor', 'name photoURL')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit);
    
    // Format courses for admin dashboard
    const formattedCourses = courses.map(course => ({
      id: course._id,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnail,
      category: course.categoryId ? course.categoryId.name : 'Uncategorized',
      level: course.level,
      duration: course.duration,
      students: course.studentsCount,
      isPublished: course.status === 'Published',
      revenue: 0, // Placeholder - to be implemented with actual revenue tracking
      instructor: course.instructorName
    }));

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / parsedLimit);

    res.status(200).json({
      success: true,
      count: formattedCourses.length,
      totalCount,
      totalPages,
      currentPage: parsedPage,
      courses: formattedCourses
    });
  } catch (error) {
    console.error('Get admin courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's enrolled courses
router.get('/enrolled', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user with populated enrolled courses
    const user = await User.findById(userId)
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

// Get single course by ID
router.get('/:id', async (req, res) => {
  try {
    // Validate ObjectId format to prevent errors
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid course ID format' });
    }
    
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name photoURL')
      .populate('categoryId', 'name');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
  res.status(200).json({
      success: true,
      course
    });
  } catch (error) {
    console.error('Get course error:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a test Machine Learning course (for development purposes)
router.get('/test/create-ml-course', async (req, res) => {
  try {
    // Check if the ML course already exists
    const existingCourse = await Course.findOne({ title: 'Complete Machine Learning Engineering Bootcamp' });
    
    if (existingCourse) {
      return res.status(200).json({ 
        success: true, 
        message: 'ML course already exists',
        course: existingCourse
      });
    }
    
    // We'll use the first admin user as instructor
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      return res.status(404).json({ message: 'No admin user found to set as instructor' });
    }
    
    // Create a new ML course
    const newCourse = new Course({
      title: 'Complete Machine Learning Engineering Bootcamp',
      description: 'Master the skills needed to become a Machine Learning Engineer with this comprehensive bootcamp. Learn to build, train, and deploy machine learning models using Python, TensorFlow, and cloud platforms.',
      thumbnail: 'https://images.unsplash.com/photo-1555952494-efd681c7e3f9?auto=format&fit=crop&w=800&q=60',
      instructor: adminUser._id,
      instructorName: 'Dr. Emily Johnson',
      level: 'Intermediate',
      duration: '45 hours',
      modules: [
        {
          title: 'Introduction to Machine Learning',
          description: 'Learn the fundamentals of machine learning concepts and algorithms.',
          order: 1,
          lessons: [
            {
              title: 'What is Machine Learning?',
              type: 'video',
              content: 'Introduction to machine learning and its applications',
              duration: 15,
              videoUrl: 'https://drive.google.com/file/d/1u_6qzgOTrIEbXVh6X9VC2O4WQjFNfFrt/view?usp=drive_link',
              order: 1
            },
            {
              title: 'Supervised vs. Unsupervised Learning',
              type: 'video',
              content: 'Understanding different machine learning paradigms',
              duration: 20,
              videoUrl: 'https://drive.google.com/file/d/1u_6qzgOTrIEbXVh6X9VC2O4WQjFNfFrt/view?usp=drive_link',
              order: 2
            }
          ]
        },
        {
          title: 'Python for Machine Learning',
          description: 'Master the essential Python libraries for machine learning.',
          order: 2,
          lessons: [
            {
              title: 'NumPy and Pandas Basics',
              type: 'video',
              content: 'Working with numerical data and data frames',
              duration: 25,
              videoUrl: 'https://drive.google.com/file/d/1u_6qzgOTrIEbXVh6X9VC2O4WQjFNfFrt/view?usp=drive_link',
              order: 1
            },
            {
              title: 'Data Visualization with Matplotlib',
              type: 'video',
              content: 'Creating effective visualizations for data analysis',
              duration: 20,
              videoUrl: 'https://drive.google.com/file/d/1u_6qzgOTrIEbXVh6X9VC2O4WQjFNfFrt/view?usp=drive_link',
              order: 2
            }
          ]
        }
      ],
      learningPoints: [
        'Build and train machine learning models using Python',
        'Understand the mathematics behind popular ML algorithms',
        'Implement neural networks using TensorFlow and Keras',
        'Deploy ML models to production environments',
        'Optimize and troubleshoot common ML engineering challenges'
      ],
      published: true,
      status: 'Published',
      language: 'English',
      studentsCount: 0
    });
    
    // Save the course to the database
    await newCourse.save();
    
    res.status(201).json({
      success: true,
      message: 'Machine Learning course created successfully',
      courseId: newCourse._id
    });
  } catch (error) {
    console.error('Create ML course error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new course (admin only)
router.post(
  '/',
  [
    authenticate,
    isAdmin,
    body('title', 'Title is required').not().isEmpty(),
    body('description', 'Description is required').not().isEmpty(),
    body('thumbnail', 'Thumbnail is required').not().isEmpty(),
    body('level', 'Level is required').isIn(['Beginner', 'Intermediate', 'Advanced']),
    body('duration', 'Duration is required').not().isEmpty()
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      title,
      description,
      thumbnail,
      level,
      duration,
      modules,
      learningPoints,
      categoryId,
      language,
      status
    } = req.body;
    
    try {
      // Create new course
      const course = new Course({
        title,
        description,
        thumbnail,
        instructor: req.user.id,
        instructorName: req.user.name,
        level,
        duration,
        modules: modules || [],
        learningPoints: learningPoints || [],
        categoryId: categoryId || null,
        language: language || 'English',
        status: status || 'Draft'
      });
      
      await course.save();
      
      // Update category course count if category is provided
      if (categoryId) {
        await Category.findByIdAndUpdate(
          categoryId,
          { $inc: { coursesCount: 1 } }
        );
      }
      
  res.status(201).json({
    success: true,
    message: 'Course created successfully',
        course
      });
    } catch (error) {
      console.error('Create course error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update a course (admin only)
router.put(
  '/:id',
  [
    authenticate,
    isAdmin
  ],
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
      
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      // Update course fields with provided data
      const updatedCourse = await Course.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      
  res.status(200).json({
    success: true,
    message: 'Course updated successfully',
        course: updatedCourse
      });
    } catch (error) {
      console.error('Update course error:', error);
      
      // Handle invalid ObjectId
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete a course (admin only)
router.delete('/:id', [authenticate, isAdmin], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Remove course
    await Course.deleteOne({ _id: req.params.id });
    
    // Update category course count if category is associated
    if (course.categoryId) {
      await Category.findByIdAndUpdate(
        course.categoryId,
        { $inc: { coursesCount: -1 } }
      );
    }
    
  res.status(200).json({
    success: true,
    message: 'Course deleted successfully'
  });
  } catch (error) {
    console.error('Delete course error:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Enroll user in a course
router.post('/enroll/:id', authenticate, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is already enrolled
    const user = await User.findById(userId);
    const alreadyEnrolled = user.enrolledCourses.some(
      course => course.courseId.toString() === courseId
    );
    
    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }
    
    // Add course to user's enrolledCourses
    user.enrolledCourses.push({
      courseId,
      progress: 0,
      enrollment_date: Date.now(),
      lastAccessed: Date.now(),
      completedLessons: []
    });
    
    await user.save();
    
    // Increment course student count
    course.studentsCount += 1;
    await course.save();
    
    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in course'
    });
  } catch (error) {
    console.error('Enroll course error:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark course as completed
router.put('/complete/:id', authenticate, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is enrolled in the course
    const user = await User.findById(userId);
    const enrolledCourse = user.enrolledCourses.find(
      course => course.courseId.toString() === courseId
    );
    
    if (!enrolledCourse) {
      return res.status(400).json({ message: 'Not enrolled in this course' });
    }
    
    // Update course progress to 100% and set completion date
    enrolledCourse.progress = 100;
    enrolledCourse.completion_date = Date.now();
    
    await user.save();
    
    // Check if a certificate already exists
    const existingCertificate = user.certificates.some(
      cert => cert.courseId.toString() === courseId
    );
    
    // Generate a certificate if one doesn't already exist
    if (!existingCertificate) {
      // Generate a unique certificate number
      const certificateNumber = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // Create certificate
      user.certificates.push({
        courseId,
        courseName: course.title,
        issueDate: new Date(),
        certificateNumber
      });
      
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Course marked as completed and certificate generated',
      certificate: !existingCertificate
    });
  } catch (error) {
    console.error('Complete course error:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user's course progress
router.put('/progress/:id', authenticate, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;
    const { progress, completedLessonId, moduleId } = req.body;
    
    const user = await User.findById(userId);
    
    // Find the enrolled course
    const enrolledCourseIndex = user.enrolledCourses.findIndex(
      course => course.courseId.toString() === courseId
    );
    
    if (enrolledCourseIndex === -1) {
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }
    
    // Update progress
    if (progress !== undefined) {
      user.enrolledCourses[enrolledCourseIndex].progress = progress;
    }
    
    // Update last accessed
    user.enrolledCourses[enrolledCourseIndex].lastAccessed = Date.now();
    
    // Add completed lesson
    if (completedLessonId && !user.enrolledCourses[enrolledCourseIndex].completedLessons.includes(completedLessonId)) {
      user.enrolledCourses[enrolledCourseIndex].completedLessons.push(completedLessonId);
    }
    
    // Add completed module
    if (moduleId && !user.enrolledCourses[enrolledCourseIndex].completedModules.includes(moduleId)) {
      user.enrolledCourses[enrolledCourseIndex].completedModules.push(moduleId);
    }
    
    await user.save();
    
  res.status(200).json({
    success: true,
      message: 'Progress updated successfully',
      enrolledCourse: user.enrolledCourses[enrolledCourseIndex]
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit quiz result
router.post('/quiz/:courseId/:quizId', authenticate, async (req, res) => {
  try {
    const { courseId, quizId } = req.params;
    const { score, totalQuestions, timeTaken } = req.body;
    
    const user = await User.findById(req.user.id);
    
    // Find the enrolled course
    const enrolledCourseIndex = user.enrolledCourses.findIndex(
      course => course.courseId.toString() === courseId
    );
    
    if (enrolledCourseIndex === -1) {
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }
    
    // Add quiz result
    const quizResult = {
      quizId,
      score,
      totalQuestions,
      timeTaken,
      completedAt: Date.now()
    };
    
    user.enrolledCourses[enrolledCourseIndex].quizResults.push(quizResult);
    
    await user.save();
    
  res.status(200).json({
      success: true,
      message: 'Quiz result submitted successfully',
      quizResult
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
