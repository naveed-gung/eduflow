# EduFlow - Online Learning Platform

<div align="center">
  <img src="client/public/favicon.svg" alt="EduFlow Logo" width="180"/>
  <h3>Learn Anywhere, Anytime</h3>
</div>

## Overview

EduFlow is a full-stack e-learning platform built with the MERN stack (MongoDB, Express, React, Node.js). It offers a comprehensive learning experience with features like course enrollment, video lectures, quizzes, progress tracking, and certificate generation.

### Key Features

- **Authentication & Authorization**
  - Email and Password login
  - Google authentication
  - Role-based access control (admin and student)
  - "Remember Me" functionality

- **Course Management**
  - Browse and search courses
  - Course creation and editing (admin)
  - Video lectures and quizzes
  - Progress tracking

- **Student Experience**
  - Course enrollment
  - Learning dashboard
  - Progress tracking
  - Completion certificates

- **Certificate System**
  - Automatic certificate generation upon course completion
  - PDF download capability
  - Certificate verification system

- **User Profile**
  - Profile customization
  - Avatar upload and management
  - Learning statistics

- **AI Assistant**
  - Context-aware AI chat support
  - Personalized learning recommendations
  - Voice output capability

## Tech Stack

### Frontend
- React with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- shadcn/ui component library
- Authentication with JWT and Firebase
- jsPDF and html2canvas for certificate generation

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Express Validator for request validation
- Multer for file uploads

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Firebase account (for Google authentication)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/eduflow.git
   cd eduflow
   ```

2. Install dependencies for both client and server:
   ```bash
   npm run install-all
   ```

3. Configure environment variables:
   - Create a `.env` file in the server directory based on `.env.example`
   - Set up MongoDB connection
   - Configure Firebase credentials

4. Run the application:
   ```bash
   # Development mode (runs both client and server)
   npm run dev
   
   # Run client only
   npm run client
   
   # Run server only
   npm run server
   ```

5. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Deployment to Render

EduFlow is configured for easy deployment to [Render](https://render.com) as a single Web Service.

### Steps for Deployment

1. **Create a MongoDB Atlas Database**
   - Sign up for [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Set up database access (username & password)
   - Add a network access rule for Render IPs (0.0.0.0/0 for simplicity)
   - Get your connection string

2. **Set up GitHub Repository**
   - Push your code to GitHub
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push
   ```

3. **Deploy to Render**
   - Sign up for [Render](https://render.com)
   - From your dashboard, select "New" and "Web Service"
   - Connect your GitHub repo
   - Configure your Web Service:
     - **Name**: `eduflow` (or your preferred name)
     - **Environment**: `Node`
     - **Build Command**: `npm run install-all`
     - **Start Command**: `NODE_ENV=production npm start`
     - **Auto-Deploy**: Enable

4. **Set Environment Variables in Render**
   - In your Web Service settings, add the following environment variables:
     - `NODE_ENV`: `production`
     - `PORT`: `10000` (Render will provide its own port)
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: Your secret key for JWT tokens
     - `RENDER`: `true`
     - All Firebase configuration variables from your `.env` file

5. **Wait for Deployment**
   - Render will build and deploy your application
   - Once deployed, you can access your application at the provided Render URL

### Updating the Deployed Application

To update your deployed application after making changes:

1. Commit and push your changes to GitHub
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```

2. Render will automatically rebuild and deploy your application if auto-deploy is enabled

## Environment Variables

### Server Environment Variables
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_firebase_private_key_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_CLIENT_ID=your_firebase_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
```

### Client Environment Variables
For development, create a `.env.development` file in the client directory:
```
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

For production, a `.env.production` file is already set up to use relative paths.

## Folder Structure

```
eduflow/
├── client/               # Frontend React application
│   ├── public/           # Static assets
│   └── src/              # React source code
│       ├── components/   # Reusable components
│       ├── context/      # React context providers
│       ├── hooks/        # Custom hooks
│       ├── lib/          # Utility functions
│       ├── pages/        # Page components
│       └── App.tsx       # Main App component
│
├── server/               # Backend Node.js application
│   ├── src/              # Server source code
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── seeders/      # Database seed scripts
│   │   └── index.js      # Server entry point
│   └── .env              # Environment variables
│
└── package.json          # Root package.json for project-wide scripts
```


