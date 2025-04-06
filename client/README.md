# EduFlow - Client

This is the frontend application for the EduFlow online learning platform, built with React, TypeScript, and Tailwind CSS.

## Features

- **User Interface**
  - Responsive design for all devices
  - Dark/light mode toggle
  - Customizable UI with accent colors
  - Accessibility features
  - Modern, clean interface with shadcn/ui components

- **Authentication**
  - Email & password login
  - Google OAuth integration
  - JWT-based auth with local storage
  - Persistent sessions with "Remember me" option
  - Protected routes based on user roles

- **Course Experience**
  - Course browsing and searching
  - Course detail pages with modules and lessons
  - Video player for lectures
  - Quiz taking and results
  - Progress tracking
  - Course completion and certificates

- **Student Dashboard**
  - Enrolled courses display
  - Learning progress statistics
  - Recently accessed courses
  - Certificate management
  - Profile customization

- **Admin Dashboard**
  - Course management (CRUD operations)
  - Student management
  - Analytics and statistics
  - Certificate management
  - Category management

- **Certificate System**
  - Certificate display
  - PDF generation with jsPDF
  - Certificate verification
  - Certificate sharing

- **AI Assistant**
  - Context-aware AI chat support
  - Voice output capability
  - Customizable assistant preferences
  - Learning recommendations

## Technologies Used

- **Framework**: React with TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (based on Radix UI)
- **State Management**: React Context API
- **Authentication**: JWT with local storage
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **PDF Generation**: jsPDF and html2canvas
- **Toast Notifications**: Sonner
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository and navigate to the client directory
   ```bash
   cd eduflow/client
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the client directory with the following variables:
   ```
   VITE_API_URL=http://localhost:5000/api
   
   # Firebase config for Google authentication
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

4. Run the development server
   ```bash
npm run dev
```

5. For production build
   ```bash
   npm run build
   ```

## Project Structure

```
client/
├── public/                # Static assets
│   ├── logo.png           # Application logo
│   └── favicon.ico        # Favicon
│
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/            # Basic UI components from shadcn/ui
│   │   ├── CourseCard.tsx # Course display component
│   │   ├── MainNav.tsx    # Main navigation component
│   │   └── ...
│   │
│   ├── context/           # React Context providers
│   │   ├── AuthProvider.tsx   # Authentication provider
│   │   └── ThemeProvider.tsx  # Theme provider
│   │
│   ├── hooks/             # Custom React hooks
│   │   ├── use-toast.ts   # Toast notifications hook
│   │   └── ...
│   │
│   ├── lib/               # Utility functions and constants
│   │   ├── utils.ts       # Utility functions
│   │   ├── firebase.ts    # Firebase configuration
│   │   └── data/          # Mock data (for development)
│   │
│   ├── pages/             # Page components
│   │   ├── HomePage.tsx   # Landing page
│   │   ├── CoursesPage.tsx # Courses listing page
│   │   ├── ProfilePage.tsx # User profile page
│   │   └── ...
│   │
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global CSS
│
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## Key Components

### Authentication

Authentication is handled through `AuthProvider.tsx`, which provides login, register, and Google authentication functions. User session data is stored in local storage and managed through React Context.

### Course Management

Courses are displayed using the `CourseCard` component. Course details and enrollment are managed through the `CourseDetailPage` component. The `CourseForm` component is used for course creation and editing by administrators.

### Certificate System

The certificate system consists of multiple components:
- `CertificateCard` displays a certificate summary
- `CertificateViewer` displays the full certificate
- `CertificateVerifierPage` allows public verification of certificates

### AI Assistant

The `AIAssistant` component provides an intelligent chat interface that helps users navigate the platform, find courses, and get answers to their questions.

## Customization

### Theme

The application supports light and dark themes, which can be toggled in the settings. The theme system is built using Tailwind CSS and CSS variables.

### UI Components

UI components are built using shadcn/ui, which provides a set of accessible, customizable components based on Radix UI primitives and styled with Tailwind CSS.

## Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run lint` - Lint the codebase
- `npm run preview` - Preview the production build locally

## Best Practices

- **Component Organization**: Components are organized by feature and reusability
- **TypeScript**: All components and functions are typed
- **Accessibility**: All components meet WCAG 2.1 accessibility guidelines
- **Responsive Design**: Application is fully responsive for all device sizes
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Loading indicators for all asynchronous operations

## Client-Server Connection

This frontend application connects to a Node.js/Express.js backend server located in the `../server` directory. The connection is configured as follows:

### API Configuration

- The frontend communicates with the backend API at `http://localhost:5000/api`
- Authentication is handled via JWT tokens stored in localStorage
- Axios is used for all API requests

### Authentication Flow

1. User registers or logs in through the frontend forms
2. Backend validates credentials and returns a JWT token and user information
3. Frontend stores the token and user data in localStorage
4. Token is included in subsequent API requests via Authorization header
