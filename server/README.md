# EduFlow - Server

This is the backend API for the EduFlow online learning platform, built with Node.js, Express, and MongoDB.

## Features

- **Authentication**
  - JWT-based authentication
  - Google OAuth integration
  - Role-based authorization (admin/student)
  - Email & password login with bcrypt encryption
  - "Remember me" functionality with extended token expiry

- **Course Management**
  - Course CRUD operations
  - Module and lesson management
  - Media upload and storage
  - Pagination and filtering
  - Search functionality

- **User Management**
  - User profiles and preferences
  - Avatar upload and management
  - Role management
  - Student enrollment tracking

- **Progress Tracking**
  - Course completion status
  - Lesson progress
  - Quiz results
  - Certificate generation

- **Certificate System**
  - Automatic certificate generation
  - Certificate verification endpoints
  - Certificate PDF data endpoints
  - Certificate management

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/google` - Login with Google
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - Get all published courses
- `GET /api/courses/admin` - Get all courses (admin only)
- `GET /api/courses/enrolled` - Get user's enrolled courses
- `GET /api/courses/:id` - Get a single course
- `POST /api/courses` - Create a new course (admin only)
- `PUT /api/courses/:id` - Update a course (admin only)
- `DELETE /api/courses/:id` - Delete a course (admin only)
- `POST /api/courses/enroll/:id` - Enroll in a course
- `PUT /api/courses/complete/:id` - Mark a course as completed
- `PUT /api/courses/progress/:id` - Update course progress
- `POST /api/courses/quiz/:courseId/:quizId` - Submit quiz result

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/avatar` - Upload user avatar
- `DELETE /api/users/avatar` - Remove user avatar
- `GET /api/users/student/dashboard-stats` - Get student dashboard stats
- `GET /api/users/admin/dashboard-stats` - Get admin dashboard stats
- `GET /api/users/certificates` - Get user certificates
- `GET /api/users/recent-students` - Get recent students (admin only)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category (admin only)
- `PUT /api/categories/:id` - Update a category (admin only)
- `DELETE /api/categories/:id` - Delete a category (admin only)

### Certificates
- `GET /api/certificates/verify/:id` - Verify a certificate
- `GET /api/certificates/:id` - Get certificate details

## Technologies Used

- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken), bcrypt, Firebase Admin SDK
- **Validation**: express-validator
- **File Upload**: multer, base64 handling
- **Development**: nodemon for hot-reloading

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Firebase project (for Google auth)

### Installation

1. Clone the repository and navigate to the server directory
   ```bash
   cd eduflow/server
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables by creating a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLIENT_URL=http://localhost:5173
   
   # Firebase Admin SDK config (for Google authentication)
   FIREBASE_TYPE=service_account
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY_ID=your_private_key_id
   FIREBASE_PRIVATE_KEY="your_private_key"
   FIREBASE_CLIENT_EMAIL=your_client_email
   FIREBASE_CLIENT_ID=your_client_id
   FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
   FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
   FIREBASE_CLIENT_CERT_URL=your_client_cert_url
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

5. For production
   ```bash
   npm start
   ```

## Database Models

### User
- Basic info (name, email, password)
- Role (admin/student)
- Enrolled courses with progress
- Profile settings and preferences
- Certificates earned

### Course
- Basic info (title, description, thumbnail)
- Instructor information
- Modules and lessons
- Learning points
- Categories and metadata

### Category
- Name
- Courses count
- Description

### Module
- Title
- Description
- Lessons
- Order

### Lesson
- Title
- Type (video, quiz, text)
- Content
- Duration
- Order

### Certificate
- Course ID
- Student ID
- Issue date
- Certificate number
- Verification status

## Development

### Folder Structure
```
server/
├── src/
│   ├── middleware/     # Express middleware
│   │   ├── auth.js     # Authentication middleware
│   │   └── upload.js   # File upload middleware
│   │
│   ├── models/         # Mongoose models
│   │   ├── User.js
│   │   ├── Course.js
│   │   └── Category.js
│   │
│   ├── routes/         # API routes
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── users.js
│   │   └── categories.js
│   │
│   ├── seeders/        # Database seed scripts
│   │   ├── coursesSeeder.js
│   │   └── usersSeeder.js
│   │
│   └── index.js        # Express app setup
│
├── .env                # Environment variables
└── package.json        # Dependencies and scripts
```

### Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Run database seeders 