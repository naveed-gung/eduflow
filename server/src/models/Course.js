
const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['video', 'quiz', 'text', 'assignment'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: function() {
      return this.type === 'video';
    }
  },
  videoUrl: {
    type: String,
    required: function() {
      return this.type === 'video';
    }
  },
  questions: [{
    text: String,
    options: [String],
    correctAnswer: Number
  }],
  order: {
    type: Number,
    required: true
  }
});

const ModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  lessons: [LessonSchema],
  order: {
    type: Number,
    required: true
  }
});

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  instructorName: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  modules: [ModuleSchema],
  learningPoints: [String],
  published: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Draft', 'Under Review', 'Published'],
    default: 'Draft'
  },
  language: {
    type: String,
    default: 'English'
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  studentsCount: {
    type: Number,
    default: 0
  },
  rating: {
    avgScore: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    rating: Number,
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', CourseSchema);
