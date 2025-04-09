const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const Course = require('../models/Course');
const { authenticate, isAdmin } = require('../middleware/auth');
const crypto = require('crypto');

// Generate certificate for completed course
router.post(
  '/generate',
  [
    authenticate,
    body('courseId', 'Course ID is required').not().isEmpty()
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId } = req.body;
    const userId = req.user.id;

    try {
      // Check if course exists
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check if user has completed the course
      const user = await User.findById(userId);
      const enrolledCourse = user.enrolledCourses.find(
        course => course.courseId.toString() === courseId && course.progress === 100
      );

      if (!enrolledCourse) {
        return res.status(400).json({ 
          message: 'Cannot generate certificate: course not completed' 
        });
      }

      // Check if certificate for this course already exists
      const certificateExists = user.certificates.some(
        cert => cert.courseId.toString() === courseId
      );

      if (certificateExists) {
        return res.status(400).json({ 
          message: 'Certificate for this course already exists' 
        });
      }

      // Generate a unique certificate ID
      const certificateId = new mongoose.Types.ObjectId();
      
      // Create certificate
      const certificate = {
        _id: certificateId,
        courseId,
        courseName: course.title,
        issueDate: new Date(),
        certificateNumber: `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
      };

      // Add certificate to user's certificates array
      user.certificates.push(certificate);
      await user.save();

      res.status(201).json({
        success: true,
        message: 'Certificate generated successfully',
        certificate
      });
    } catch (error) {
      console.error('Generate certificate error:', error);
      
      // Handle invalid ObjectId
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Verify a certificate by ID
router.get('/verify/:certificateId', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificateId: req.params.certificateId
    });
    
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found or invalid' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Certificate is valid',
      certificate: {
        certificateId: certificate.certificateId,
        userName: certificate.userName,
        courseName: certificate.courseName,
        issueDate: certificate.issueDate
      }
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify a certificate by certificate number (public route)
router.get('/verify-by-number/:certificateNumber', async (req, res) => {
  try {
    const certificateNumber = req.params.certificateNumber;
    
    // Find the user with this certificate number
    const user = await User.findOne({
      'certificates.certificateNumber': certificateNumber
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Certificate not found or invalid' 
      });
    }
    
    // Find the specific certificate in the user's certificates array
    const certificate = user.certificates.find(cert => 
      cert.certificateNumber === certificateNumber
    );
    
    if (!certificate) {
      return res.status(404).json({ 
        success: false,
        message: 'Certificate not found or invalid' 
      });
    }
    
    // Get the associated course
    const course = await Course.findById(certificate.courseId)
      .select('title instructorName');
    
    res.status(200).json({
      success: true,
      message: 'Certificate is valid',
      certificate: {
        certificateNumber: certificate.certificateNumber,
        userName: user.name,
        userEmail: user.email,
        courseName: certificate.courseName,
        courseTitle: course?.title || certificate.courseName,
        instructorName: course?.instructorName || 'EduFlow Instructor',
        issueDate: certificate.issueDate
      }
    });
  } catch (error) {
    console.error('Verify certificate by number error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's certificates
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user with certificates
    const user = await User.findById(userId)
      .populate({
        path: 'certificates.courseId',
        select: 'title thumbnail instructorName'
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      certificates: user.certificates
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single certificate by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const certificateId = req.params.id;
    
    // Get user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find certificate in user's certificates
    const certificate = user.certificates.id(certificateId);
    
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    
    // Get associated course
    const course = await Course.findById(certificate.courseId)
      .select('title thumbnail instructorName');
    
    res.status(200).json({
      success: true,
      certificate,
      course
    });
  } catch (error) {
    console.error('Get certificate error:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// ADMIN ROUTES

// Get all user certificates for admin (searches in user documents)
router.get('/admin', [authenticate, isAdmin], async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    
    // Find users with certificates
    const usersWithCertificates = await User.find({ 
      'certificates.0': { $exists: true },
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'certificates.courseName': { $regex: search, $options: 'i' } },
        { 'certificates.certificateNumber': { $regex: search, $options: 'i' } }
      ]
    }).select('name email certificates');
    
    // Extract all certificates with user information
    let allCertificates = [];
    usersWithCertificates.forEach(user => {
      user.certificates.forEach(cert => {
        allCertificates.push({
          _id: cert._id,
          certificateNumber: cert.certificateNumber,
          courseName: cert.courseName,
          courseId: cert.courseId,
          issueDate: cert.issueDate,
          userId: {
            _id: user._id,
            name: user.name,
            email: user.email
          }
        });
      });
    });
    
    // Sort by issue date, newest first
    allCertificates.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
    
    // Calculate pagination
    const totalCount = allCertificates.length;
    const startIndex = (parsedPage - 1) * parsedLimit;
    const endIndex = startIndex + parsedLimit;
    const paginatedCertificates = allCertificates.slice(startIndex, endIndex);
    
    res.status(200).json({
      success: true,
      certificates: paginatedCertificates,
      count: paginatedCertificates.length,
      totalCount,
      totalPages: Math.ceil(totalCount / parsedLimit),
      currentPage: parsedPage
    });
  } catch (error) {
    console.error('Get admin user certificates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all certificates (admin only) - this returns from the Certificate model
router.get('/admin/all', [authenticate, isAdmin], async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // Count total documents
    const totalCount = await Certificate.countDocuments();
    
    // Paginate results
    const certificates = await Certificate.find()
      .populate('userId', 'name email')
      .populate('courseId', 'title')
      .sort({ issueDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: certificates.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
      certificates
    });
  } catch (error) {
    console.error('Get all certificates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 