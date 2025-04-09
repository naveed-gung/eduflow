import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeProvider";
import { AuthProvider, useAuth } from "@/context/AuthProvider";
import { AIAssistant } from "@/components/AIAssistant";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";

// Pages
import Index from "./pages/Index";
import CoursesPage from "./pages/CoursesPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCertificatesPage from "./pages/AdminCertificatesPage";
import CertificateVerifierPage from "./pages/CertificateVerifierPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import StudentCertificatesPage from './pages/StudentCertificatesPage';

// Layout components
import { MainNav } from "./components/MainNav";

const queryClient = new QueryClient();

// AuthRoute component to protect routes
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  // Show nothing while checking authentication
  if (isLoading) {
    return null;
  }
  
  // If user is authenticated, redirect to their dashboard based on role
  if (isAuthenticated && user) {
    // Use user from context instead of localStorage to ensure it's the most up-to-date
    const dashboardPath = user.role === 'admin' ? '/dashboard/admin' : '/dashboard/student';
    console.log(`Redirecting authenticated user to ${dashboardPath}`);
    return <Navigate to={dashboardPath} replace />;
  }
  
  // If not authenticated, render the children (login/signup page)
  return <>{children}</>;
};

// Protected route component to ensure user is authenticated
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show nothing while checking authentication
  if (isLoading) {
    return null;
  }
  
  // If user is not authenticated, redirect to sign in page
  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to signin page');
    return <Navigate to="/signin" replace />;
  }
  
  // If authenticated, render the children (protected page)
  return <>{children}</>;
};

// Conditional AI Assistant Component that doesn't render on admin pages
const ConditionalAIAssistant = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.includes('/dashboard/admin') || 
                     location.pathname.includes('/admin/');
  
  if (isAdminPage) return null;
  
  return <AIAssistant />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {/* Log when App renders with current auth context */}
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

// AppContent component to access auth context
const AppContent = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // Log app render with auth state
  useEffect(() => {
    console.log('App rendered with auth state:', { 
      isAuthenticated, 
      isLoading, 
      userRole: user?.role 
    });
  }, [isAuthenticated, isLoading, user]);
  
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="relative min-h-screen flex flex-col">
        <MainNav />
        <main className="flex-1">
          <Routes>
            {/* 
              Route Protection Strategy:
              - Public routes: No protection, accessible to all users
              - Auth routes: Wrapped with AuthRoute, redirects logged-in users to their dashboard
              - Protected routes: Wrapped with ProtectedRoute, redirects non-authenticated users to signin
            */}
            <Route path="/" element={<Index />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/course-detail/:id" element={<CourseDetailPage />} />
            <Route path="/signin" element={
              <AuthRoute>
                <SignInPage />
              </AuthRoute>
            } />
            <Route path="/signup" element={
              <AuthRoute>
                <SignUpPage />
              </AuthRoute>
            } />
            <Route path="/dashboard/student" element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/certificates" element={
              <ProtectedRoute>
                <AdminCertificatesPage />
              </ProtectedRoute>
            } />
            <Route path="/verify-certificate" element={<CertificateVerifierPage />} />
            <Route path="/profile/:role" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/certificates" element={
              <ProtectedRoute>
                <StudentCertificatesPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <ConditionalAIAssistant />
      </div>
    </TooltipProvider>
  );
};

export default App;
