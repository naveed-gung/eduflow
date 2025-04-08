import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CourseGrid } from "@/components/CourseGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthProvider';
import axios from 'axios';
import { toast } from 'sonner';
import { BookOpen, Clock, GraduationCap, Trophy, Award, ArrowUpRight, Star, BookCheck } from 'lucide-react';
import { CertificateCard } from '@/components/CertificateCard';
import { CertificateViewer } from '@/components/CertificateViewer';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';  // Import the API client

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [isCertificateDialogOpen, setIsCertificateDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    certificatesEarned: 0,
    averageProgress: 0,
    totalLearningTime: 0,
    lastAccessedCourse: null
  });
  
  // Fetch user's enrolled courses, stats, and certificates
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('eduflow-token');
        if (!token) return;
        
        // Fetch enrolled courses
        const coursesResponse = await api.get(`/courses/enrolled`);
        
        if (coursesResponse.data.success && coursesResponse.data.enrolledCourses) {
          // Transform enrolled courses to match CourseProps interface
          const formattedCourses = coursesResponse.data.enrolledCourses.map(enrollment => ({
            id: enrollment.courseId._id,
            title: enrollment.courseId.title,
            description: enrollment.courseId.description || '',
            instructor: enrollment.courseId.instructorName || 'Instructor',
            thumbnailUrl: enrollment.courseId.thumbnail,
            category: enrollment.courseId.level,
            duration: enrollment.courseId.duration,
            lessonsCount: 0, // This should be fetched from the course if available
            progress: enrollment.progress,
            showProgress: true,
            isEnrolled: true
          }));
          
          setEnrolledCourses(formattedCourses);
        }
        
        // Fetch dashboard stats
        const statsResponse = await api.get(`/users/student/dashboard-stats`);
        
        if (statsResponse.data.success) {
          setStats(statsResponse.data.stats);
        }
        
        // Fetch user certificates
        const certificatesResponse = await api.get(`/certificates`);
        
        if (certificatesResponse.data.success) {
          setCertificates(certificatesResponse.data.certificates || []);
        }
        
        // Also fetch some recommended courses
        const recommendedResponse = await api.get(`/courses?limit=6`);
        
        if (recommendedResponse.data.success && recommendedResponse.data.courses) {
          // Transform courses to match CourseProps interface
          const formattedRecommended = recommendedResponse.data.courses.map(course => ({
            id: course._id,
            title: course.title,
            description: course.description || '',
            instructor: course.instructorName || 'Instructor',
            thumbnailUrl: course.thumbnail,
            category: course.level,
            duration: course.duration,
            lessonsCount: 0,
            isPopular: true
          }));
          
          setRecommendedCourses(formattedRecommended);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchDashboardData();
    }
  }, [user]);
  
  // Calculate overall progress
  const overallProgress = enrolledCourses.length > 0 
    ? Math.floor(enrolledCourses.reduce((acc, course) => acc + (course.progress || 0), 0) / enrolledCourses.length)
    : 0;
  
  // Handle certificate view
  const handleViewCertificate = (certificateId) => {
    const cert = certificates.find(c => c._id === certificateId);
    if (cert) {
      setSelectedCertificate(cert);
      setIsCertificateDialogOpen(true);
    }
  };
    
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{user?.name || 'Student'} Dashboard</h1>
        <Button onClick={() => navigate('/courses')} variant="outline" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          <span>Browse Courses</span>
        </Button>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Enrolled Courses */}
        <Card className="relative overflow-hidden border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Enrolled Courses</p>
                <p className="text-3xl font-bold">{stats.enrolledCourses}</p>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground flex items-center">
                <span className={stats.enrolledCourses > 0 ? "text-green-500" : "text-muted-foreground"}>
                  {stats.enrolledCourses > 0 ? "Active Learning" : "No courses yet"}
                </span>
              </p>
            </div>
            <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-primary/5"></div>
          </CardContent>
        </Card>
      
        {/* Completed Courses */}
        <Card className="relative overflow-hidden border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Completed Courses</p>
                <p className="text-3xl font-bold">{stats.completedCourses}</p>
              </div>
              <div className="bg-green-500/10 p-2 rounded-full">
                <BookCheck className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground flex items-center">
                <span className={stats.completedCourses > 0 ? "text-green-500" : "text-muted-foreground"}>
                  {stats.completedCourses > 0 
                    ? `${Math.round((stats.completedCourses / stats.enrolledCourses) * 100)}% completion rate` 
                    : "Complete courses to track progress"}
                </span>
              </p>
            </div>
            <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-green-500/5"></div>
          </CardContent>
        </Card>
      
        {/* Certificates */}
        <Card className="relative overflow-hidden border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Certificates</p>
                <p className="text-3xl font-bold">{certificates.length}</p>
              </div>
              <div className="bg-blue-500/10 p-2 rounded-full">
                <Award className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground flex items-center">
                <span className={certificates.length > 0 ? "text-blue-500" : "text-muted-foreground"}>
                  {certificates.length > 0 
                    ? "Certificates earned" 
                    : "Complete courses to earn certificates"}
                </span>
              </p>
            </div>
            <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-blue-500/5"></div>
          </CardContent>
        </Card>
      
        {/* Learning Time */}
        <Card className="relative overflow-hidden border-l-4 border-l-amber-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Learning Time</p>
                <p className="text-3xl font-bold">{stats.totalLearningTime || 0} hrs</p>
              </div>
              <div className="bg-amber-500/10 p-2 rounded-full">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground flex items-center">
                <span>Total time spent learning</span>
              </p>
            </div>
            <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-amber-500/5"></div>
          </CardContent>
        </Card>
      </div>
      
      {/* Progress and Last Accessed Course */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Overall Progress */}
        <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Your Learning Progress</CardTitle>
          <CardDescription>Track your overall course completion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Completion</span>
              <span className="text-sm font-medium">{overallProgress}%</span>
            </div>
              <Progress value={overallProgress} className="h-3" />
            
            <div className="pt-4 space-y-4">
                {enrolledCourses.length > 0 ? (
                  enrolledCourses.map(course => (
                <div key={course.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{course.title}</span>
                    <span className="text-xs">{course.progress || 0}%</span>
                  </div>
                  <Progress value={course.progress || 0} className="h-1.5" />
                </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    You haven't enrolled in any courses yet.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Last Accessed Course */}
        {stats.lastAccessedCourse ? (
          <Card>
            <CardHeader>
              <CardTitle>Continue Learning</CardTitle>
              <CardDescription>Pick up where you left off</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-medium">{stats.lastAccessedCourse.title}</h3>
                  <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                    <span>Progress: {stats.lastAccessedCourse.progress}%</span>
                  </div>
                  <Progress value={stats.lastAccessedCourse.progress} className="h-1.5 mt-2" />
                  <Button 
                    variant="default" 
                    className="mt-4 w-full"
                    onClick={() => navigate(`/courses/${stats.lastAccessedCourse.id}`)}
                  >
                    Continue
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Start Learning</CardTitle>
              <CardDescription>Begin your educational journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Enroll in a course to start learning</p>
                <Button 
                  variant="default" 
                  onClick={() => navigate('/courses')}
                >
                  Browse Courses
                </Button>
          </div>
        </CardContent>
      </Card>
        )}
      </div>
      
      {/* Courses Tabs */}
      <div className="mb-8">
        <Tabs defaultValue="enrolled" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="enrolled">Enrolled Courses</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="enrolled">
            <CourseGrid 
              courses={enrolledCourses}
              loading={isLoading}
              className="mt-2" 
              showProgress={true}
            />
            {!isLoading && enrolledCourses.length === 0 && (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You haven't enrolled in any courses yet.</p>
                <a href="/courses" className="text-primary hover:underline mt-2 inline-block">
                  Browse courses
                </a>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recommended">
            <CourseGrid 
              courses={recommendedCourses}
              loading={isLoading}
              className="mt-2" 
              showProgress={false}
            />
          </TabsContent>
          
          <TabsContent value="certificates">
            {!isLoading && certificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map(certificate => (
                  <CertificateCard 
                    key={certificate._id}
                    certificate={certificate}
                    onView={handleViewCertificate}
                  />
                ))}
              </div>
            ) : (
            <div className="text-center py-12">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You haven't earned any certificates yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Complete a course to earn your first certificate!</p>
            </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Certificate Viewer Dialog */}
      <CertificateViewer 
        isOpen={isCertificateDialogOpen}
        onClose={() => setIsCertificateDialogOpen(false)}
        certificate={selectedCertificate}
        userName={user?.name || ''}
      />
    </div>
  );
};

export default StudentDashboard;
