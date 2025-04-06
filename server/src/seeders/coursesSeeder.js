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

// Create categories if they don't exist
const createCategories = async () => {
  try {
    // Define categories
    const categories = [
      {
        name: 'Programming',
        description: 'Computer programming and software development courses',
        slug: 'programming',
        icon: 'code',
        featured: true,
        order: 1
      },
      {
        name: 'Data Science',
        description: 'Data analysis, machine learning, and statistics courses',
        slug: 'data-science',
        icon: 'database',
        featured: true,
        order: 2
      },
      {
        name: 'Quantum Computing',
        description: 'Quantum computing, quantum mechanics, and quantum programming courses',
        slug: 'quantum-computing',
        icon: 'atom',
        featured: true,
        order: 3
      }
    ];

    // Check if categories exist
    for (const category of categories) {
      const exists = await Category.findOne({ slug: category.slug });
      if (!exists) {
        await Category.create(category);
        console.log(`Category created: ${category.name}`);
      } else {
        console.log(`Category already exists: ${category.name}`);
      }
    }
  } catch (error) {
    console.error('Error creating categories:', error);
  }
};

// Create courses
const createCourses = async () => {
  try {
    // Find admin user to set as instructor
    const admin = await User.findOne({ email: 'admin@eduflow.com' });
    if (!admin) {
      console.log('Admin user not found. Please run adminSeeder.js first.');
      return;
    }

    // Find categories
    const programmingCategory = await Category.findOne({ slug: 'programming' });
    const quantumCategory = await Category.findOne({ slug: 'quantum-computing' });

    // Check if quantum course already exists
    const quantumCourseExists = await Course.findOne({ title: 'Quantum Programming Fundamentals' });
    if (quantumCourseExists) {
      console.log('Quantum Programming course already exists');
    } else {
      // Create Quantum Programming course
      const quantumCourse = new Course({
        title: 'Quantum Programming Fundamentals',
        description: 'Learn the fundamentals of quantum computing and programming with Qiskit and Q#. This course covers quantum mechanics basics, quantum gates, quantum algorithms, and practical quantum programming applications.',
        thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        instructor: admin._id,
        instructorName: admin.name,
        level: 'Intermediate',
        duration: '8 weeks',
        learningPoints: [
          'Quantum mechanics principles for computing',
          'Quantum gates and circuits',
          'Quantum algorithms: Grover\'s, Shor\'s, and quantum teleportation',
          'Quantum programming with Qiskit and Q#',
          'Quantum error correction and fault tolerance',
          'Practical quantum computing applications'
        ],
        status: 'Published',
        language: 'English',
        categoryId: quantumCategory ? quantumCategory._id : null,
        studentsCount: 0,
        modules: [
          {
            title: 'Introduction to Quantum Computing',
            description: 'Learn the fundamental concepts of quantum computing and how it differs from classical computing.',
            order: 1,
            lessons: [
              {
                title: 'Quantum vs Classical Computing',
                type: 'video',
                content: 'In this lesson, we explore the differences between classical and quantum computing paradigms.',
                duration: 45,
                videoUrl: 'https://example.com/videos/quantum-vs-classical',
                order: 1
              },
              {
                title: 'Quantum Bits (Qubits)',
                type: 'video',
                content: 'Understanding qubits, superposition, and entanglement - the building blocks of quantum computing.',
                duration: 60,
                videoUrl: 'https://example.com/videos/qubits',
                order: 2
              }
            ]
          },
          {
            title: 'Quantum Programming with Qiskit',
            description: 'Get started with practical quantum programming using IBM\'s Qiskit framework.',
            order: 2,
            lessons: [
              {
                title: 'Setting up Qiskit Environment',
                type: 'video',
                content: 'Learn how to set up your development environment for quantum programming with Qiskit.',
                duration: 30,
                videoUrl: 'https://example.com/videos/qiskit-setup',
                order: 1
              },
              {
                title: 'Your First Quantum Circuit',
                type: 'video',
                content: 'Build and simulate your first quantum circuit with superposition and measurement.',
                duration: 45,
                videoUrl: 'https://example.com/videos/first-quantum-circuit',
                order: 2
              },
              {
                title: 'Quantum Entanglement in Practice',
                type: 'video',
                content: 'Understand and implement quantum entanglement in practical circuits.',
                duration: 55,
                videoUrl: 'https://example.com/videos/quantum-entanglement',
                order: 3
              }
            ]
          }
        ]
      });

      await quantumCourse.save();
      console.log('Quantum Programming course created successfully');
    }

    // Create Web Development course if it doesn't exist
    const webDevCourseExists = await Course.findOne({ title: 'Advanced Web Development' });
    if (webDevCourseExists) {
      console.log('Web Development course already exists');
    } else {
      // Create Web Development course
      const webDevCourse = new Course({
        title: 'Advanced Web Development',
        description: 'Master modern web development techniques including React, Node.js, and cloud deployment. Build scalable, responsive web applications with best practices in security and performance.',
        thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1164&q=80',
        instructor: admin._id,
        instructorName: admin.name,
        level: 'Advanced',
        duration: '10 weeks',
        learningPoints: [
          'Modern React with hooks and context API',
          'Node.js and Express backend development',
          'MongoDB and GraphQL for data management',
          'Authentication and authorization',
          'Performance optimization techniques',
          'Deployment to cloud platforms'
        ],
        status: 'Published',
        language: 'English',
        categoryId: programmingCategory ? programmingCategory._id : null,
        studentsCount: 0
      });

      await webDevCourse.save();
      console.log('Web Development course created successfully');
    }

  } catch (error) {
    console.error('Error creating courses:', error);
  }
};

// Seed data
const seedData = async () => {
  try {
    await connectDB();
    await createCategories();
    await createCourses();
    
    console.log('Course seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding courses data:', error);
    process.exit(1);
  }
};

// Run the seeder
seedData(); 