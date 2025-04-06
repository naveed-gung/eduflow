const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: false // Not required for OAuth users
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },
  photoURL: {
    type: String,
    default: ''
  },
  authProvider: {
    type: String,
    enum: ['email', 'google'],
    default: 'email'
  },
  firebaseUid: {
    type: String,
    sparse: true
  },
  bio: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: 'Lebanon'
  },
  website: String,
  social: {
    linkedin: String,
    twitter: String,
    github: String
  },
  enrolledCourses: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    progress: {
      type: Number,
      default: 0
    },
    enrollment_date: {
      type: Date,
      default: Date.now
    },
    lastAccessed: {
      type: Date,
      default: Date.now
    },
    completedLessons: [{
      type: String
    }],
    completedModules: [{
      type: mongoose.Schema.Types.ObjectId
    }],
    quizResults: [{
      quizId: String,
      score: Number,
      totalQuestions: Number,
      timeTaken: Number,
      completedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  certificates: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    courseName: {
      type: String,
      required: true
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    certificateNumber: {
      type: String,
      required: true
    }
  }],
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    darkMode: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
