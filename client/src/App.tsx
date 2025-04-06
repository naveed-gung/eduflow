import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeProvider";
import { AuthProvider } from "@/context/AuthProvider";
import { AIAssistant } from "@/components/AIAssistant";
import { Footer } from "@/components/Footer";

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

// Layout components
import { MainNav } from "./components/MainNav";

const queryClient = new QueryClient();

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
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <div className="relative min-h-screen flex flex-col">
              <MainNav />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/courses" element={<CoursesPage />} />
                  <Route path="/course-detail/:id" element={<CourseDetailPage />} />
                  <Route path="/signin" element={<SignInPage />} />
                  <Route path="/signup" element={<SignUpPage />} />
                  <Route path="/dashboard/student" element={<StudentDashboard />} />
                  <Route path="/dashboard/admin" element={<AdminDashboard />} />
                  <Route path="/admin/certificates" element={<AdminCertificatesPage />} />
                  <Route path="/verify-certificate" element={<CertificateVerifierPage />} />
                  <Route path="/profile/:role" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <ConditionalAIAssistant />
            </div>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
