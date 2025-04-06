require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');
const Category = require('../models/Category');

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Helper function to get random elements from an array
const getRandomElements = (array, numElements) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result.slice(0, numElements);
};

const videoUrl = 'https://drive.google.com/file/d/1u_6qzgOTrIEbXVh6X9VC2O4WQjFNfFrt/view?usp=drive_link';

// Create additional courses for pagination testing
const createAdditionalCourses = async () => {
  try {
    // Find admin user to set as instructor
    const admin = await User.findOne({ email: 'admin@eduflow.com' });
    if (!admin) {
      console.log('Admin user not found. Please run adminSeeder.js first.');
      return;
    }

    // Find categories
    const categories = await Category.find();
    if (categories.length === 0) {
      console.log('No categories found. Please run coursesSeeder.js first.');
      return;
    }

    // Sample course data
    const courseTitles = [
      'Introduction to JavaScript',
      'Advanced React Development',
      'Node.js Fundamentals',
      'Python for Data Science',
      'Machine Learning Basics',
      'Deep Learning with TensorFlow',
      'Blockchain Development',
      'Cybersecurity Fundamentals',
      'Mobile App Development with Flutter',
      'iOS Development with Swift',
      'Android Development with Kotlin',
      'Web Design Principles',
      'UI/UX Design Masterclass',
      'GraphQL API Development',
      'Docker and Kubernetes',
      'Cloud Computing with AWS',
      'Microsoft Azure Fundamentals',
      'Google Cloud Platform',
      'DevOps Practices',
      'Full Stack Web Development',
      'Database Design and SQL',
      'NoSQL Databases',
      'Game Development with Unity',
      'Product Management',
      'Digital Marketing',
      'Content Creation and SEO',
      'Business Analytics',
      'Project Management',
      'Agile and Scrum',
      'Leadership and Management'
    ];

    const courseDescriptions = [
      'Learn the fundamentals and advanced concepts of this popular technology. This course is designed for beginners and advanced learners alike.',
      'Master the essential skills and techniques with hands-on projects and real-world applications. Perfect for those looking to advance their career.',
      'Comprehensive guide covering everything from basic principles to advanced strategies. Includes practical examples and case studies.',
      'Gain practical experience through interactive exercises and projects. This course will give you the skills employers are looking for.',
      'From theory to practice - learn how to implement solutions to real-world problems. Includes certification preparation.',
      'Step-by-step guide to mastering modern development techniques and best practices. Taught by industry experts with years of experience.'
    ];

    const learningPoints = [
      'Understand core concepts and principles',
      'Build real-world projects from scratch',
      'Master essential techniques and best practices',
      'Learn to debug and troubleshoot common issues',
      'Optimize performance and security',
      'Deploy applications to production environments',
      'Integrate with third-party services and APIs',
      'Implement responsive and accessible design',
      'Write clean, maintainable code',
      'Follow industry standards and conventions',
      'Use modern development tools and workflows',
      'Collaborate effectively in development teams'
    ];

    const levels = ['Beginner', 'Intermediate', 'Advanced'];
    const durations = ['4 weeks', '6 weeks', '8 weeks', '12 weeks', '10 hours', '20 hours', '30 hours'];
    const languages = ['English', 'French', 'Spanish', 'Arabic'];
    const statuses = ['Published', 'Draft'];

    // Define a set of image URLs to use for course thumbnails
    const thumbnailUrls = [
      'https://images.unsplash.com/photo-1516116216624-53e697fedbea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1454165205744-3b78555e5572?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    ];

    // Define how many courses to create
    const numCoursesToCreate = 20; // Adjust as needed
    let createdCount = 0;

    // Create courses
    for (let i = 0; i < numCoursesToCreate; i++) {
      const title = courseTitles[i % courseTitles.length];
      
      // Check if course with this title already exists
      const existingCourse = await Course.findOne({ title });
      if (existingCourse) {
        console.log(`Course with title "${title}" already exists. Skipping.`);
        continue;
      }

      // Create course object
      const course = new Course({
        title,
        description: courseDescriptions[Math.floor(Math.random() * courseDescriptions.length)],
        thumbnail: thumbnailUrls[Math.floor(Math.random() * thumbnailUrls.length)],
        instructor: admin._id,
        instructorName: admin.name,
        level: levels[Math.floor(Math.random() * levels.length)],
        duration: durations[Math.floor(Math.random() * durations.length)],
        learningPoints: getRandomElements(learningPoints, Math.floor(Math.random() * 6) + 3),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        language: languages[Math.floor(Math.random() * languages.length)],
        categoryId: categories[Math.floor(Math.random() * categories.length)]._id,
        studentsCount: Math.floor(Math.random() * 100),
        rating: (Math.random() * 2 + 3).toFixed(1), // Rating between 3.0 and 5.0
        modules: [
          {
            title: 'Getting Started',
            description: 'Introduction to the course and setup instructions',
            order: 1,
            lessons: [
              {
                title: 'Course Overview',
                type: 'video',
                content: 'Welcome to the course! Here\'s what you\'ll learn.',
                duration: 15,
                order: 1,
                videoUrl: videoUrl
              },
              {
                title: 'Setting Up Your Environment',
                type: 'video',
                content: 'Learn how to set up your development environment.',
                duration: 25,
                order: 2,
                videoUrl: videoUrl
              }
            ]
          },
          {
            title: 'Core Concepts',
            description: 'Learn the fundamental concepts',
            order: 2,
            lessons: [
              {
                title: 'Basic Principles',
                type: 'video',
                content: 'Understanding the core principles.',
                duration: 35,
                order: 1,
                videoUrl: videoUrl
              },
              {
                title: 'Practical Applications',
                type: 'video',
                content: 'Applying what you\'ve learned to real-world scenarios.',
                duration: 45,
                order: 2,
                videoUrl: videoUrl
              }
            ]
          }
        ]
      });

      await course.save();
      createdCount++;
      console.log(`Created course: ${title}`);
    }

    console.log(`Successfully created ${createdCount} new courses`);
  } catch (error) {
    console.error('Error creating additional courses:', error);
  }
};

// Seed data
const seedData = async () => {
  try {
    await connectDB();
    await createAdditionalCourses();
    
    console.log('Enhanced course seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding additional courses data:', error);
    process.exit(1);
  }
};

// Run the seeder
seedData(); 