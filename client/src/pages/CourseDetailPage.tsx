import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, BookOpen, Award, CheckCircle, ExternalLink, Play, User, Users, Lock, PlayCircle, LoaderCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthProvider';
import api from '@/lib/api';  // Import the API client
import { VideoPlayer } from '@/components/VideoPlayer';

interface Lesson {
  _id: string;
  title: string;
  type: string;
  duration: number;
  order: number;
  videoUrl?: string;
}

interface Module {
  _id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: {
    _id: string;
    name: string;
    photoURL?: string;
  };
  instructorName: string;
  level: string;
  duration: string;
  modules: Module[];
  learningPoints: string[];
  language: string;
  studentsCount: number;
  status: string;
  category: string;
  rating: number;
  price: number;
}

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);
  
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        // Get the course details from the API
        const response = await api.get(`/courses/${id}`);
        
        if (response.data.success) {
          setCourse(response.data.course);
          
          // Check if user is already enrolled
          if (isAuthenticated && user) {
            const userResponse = await api.get(`/users/profile`);
            
            if (userResponse.data.success) {
              const enrolledCourseIds = userResponse.data.user.enrolledCourses.map((c: any) => 
                c.courseId._id || c.courseId
              );
              setIsEnrolled(enrolledCourseIds.includes(id));
            }
          }
        } else {
          toast.error('Failed to load course details');
          navigate('/courses');
        }
      } catch (error) {
        console.error('Error loading course:', error);
        toast.error('Failed to load course details');
        navigate('/courses');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourse();
  }, [id, navigate, isAuthenticated, user]);
  
  const handleEnrollCourse = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to enroll in this course');
      navigate('/signin');
      return;
    }
    
    try {
      setIsEnrolling(true);
      
      // Enroll user in the course
      const response = await api.post(`/courses/${id}/enroll`);
      
      if (response.data.success) {
        setIsEnrolled(true);
        toast.success('Successfully enrolled in the course!');
        
        // For demo, set a 10-second timer to mark the course as completed
        toast.info('For demo purposes, the course will be marked as completed in 10 seconds');
        
        setTimeout(async () => {
          try {
            // Mark the course as completed
            const completeResponse = await api.post(`/courses/${id}/complete`);
            
            if (completeResponse.data.success) {
              toast.success('Course marked as completed! Certificate generated.');
              
              // Refresh user data
              const userResponse = await api.get(`/users/profile`);
              
              if (userResponse.data.success) {
                const certId = userResponse.data.user.certificates.find(
                  (cert: any) => cert.courseId === id || cert.courseId?._id === id
                )?._id;
                
                if (certId) {
                  toast.success('You can view your certificate in your profile', {
                    action: {
                      label: 'View',
                      onClick: () => navigate('/dashboard/student')
                    }
                  });
                }
              }
            }
          } catch (error) {
            console.error('Error completing course:', error);
          }
        }, 10 * 1000); // 10 seconds
      } else {
        toast.error('Failed to enroll in the course');
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in the course');
    } finally {
      setIsEnrolling(false);
    }
  };
  
  const handlePlayVideo = (videoUrl: string, title: string) => {
    if (!isEnrolled) {
      toast.error('Please enroll in the course to access the video content');
      return;
    }
    setSelectedVideo({ url: videoUrl, title });
  };
  
  if (isLoading) {
    return <CourseDetailSkeleton />;
  }
  
  if (!course) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The course you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate('/courses')}>
          Browse Courses
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/5 dark:to-secondary/5 py-8 sm:py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="flex-1">
              <Badge variant="outline" className="mb-3 sm:mb-4">
                {course.level}
              </Badge>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">{course.title}</h1>
              
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                {course.description}
              </p>
              
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <Avatar>
                  <AvatarImage src={course.instructor?.photoURL} />
                  <AvatarFallback>{course.instructorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{course.instructorName}</p>
                  <p className="text-xs text-muted-foreground">Instructor</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
                <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{course.modules.reduce((acc, module) => acc + module.lessons.length, 0)} lessons</span>
                </div>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{course.studentsCount} students</span>
                </div>
                {course.level && (
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                    <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{course.level}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 sm:mt-6">
                {isEnrolled ? (
                  <Button className="w-full sm:w-auto" disabled>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Enrolled
                  </Button>
                ) : (
                  <Button 
                    onClick={handleEnrollCourse} 
                    disabled={isEnrolling}
                    className="w-full sm:w-auto"
                  >
                    {isEnrolling ? (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <PlayCircle className="mr-2 h-4 w-4" />
                    )}
                    {isEnrolling ? 'Enrolling...' : `Enroll Now${course.price > 0 ? ` - $${course.price}` : ' - Free'}`}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="w-full md:w-2/5 lg:w-1/3 mt-4 md:mt-0">
              <Card className="overflow-hidden">
                <div className="aspect-video w-full relative">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Play className="h-12 w-12 text-white opacity-80" />
                  </div>
                </div>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="font-semibold">
                        {course.price > 0 ? `$${course.price}` : 'Free'}
                      </div>
                      
                      <Badge variant={course.price > 0 ? "outline" : "default"}>
                        {course.price > 0 ? 'Premium' : 'Free'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{course.duration} of content</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">Certificate of completion</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">Access on all devices</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mt-8">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="content">Course Content</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="instructor">Instructor</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
                <CardDescription>
                  {course.modules.reduce((acc, module) => acc + module.lessons.length, 0)} lessons • {course.duration}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.modules.map((module, index) => (
                  <div key={module._id} className="border rounded-lg">
                    <div className="bg-muted/40 p-3 sm:p-4 rounded-t-lg">
                      <h3 className="font-medium text-sm sm:text-base">
                        Module {index + 1}: {module.title}
                      </h3>
                      {module.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{module.description}</p>
                      )}
                    </div>
                    <div className="divide-y">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div 
                          key={lesson._id} 
                          className="p-3 sm:p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-medium text-primary">{lessonIndex + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm sm:text-base truncate">{lesson.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground capitalize">{lesson.type}</span>
                                <span className="text-xs text-muted-foreground flex items-center">
                                  <Clock className="mr-1 h-3 w-3" />
                                  {lesson.duration} min
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {isEnrolled ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="ml-2"
                              onClick={() => handlePlayVideo(lesson.videoUrl, lesson.title)}
                            >
                              <Play className="h-4 w-4" />
                              <span className="sr-only sm:not-sr-only sm:ml-2">Play</span>
                            </Button>
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">What You'll Learn</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    {course.learningPoints && course.learningPoints.length > 0 ? (
                      course.learningPoints.map((point, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{point}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No learning points provided for this course.</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Description</h3>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="text-sm sm:text-base">{course.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="instructor" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>About the Instructor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={course.instructor?.photoURL} />
                    <AvatarFallback className="text-lg">{course.instructorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{course.instructorName}</h3>
                    <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                      Experienced instructor with expertise in {course.category}
                    </p>
                    
                    <p className="text-sm">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc vel 
                      tincidunt lacinia, nunc nisl aliquam nisl, eget aliquam nisl nunc vel nisl.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          videoUrl={selectedVideo.url}
          title={selectedVideo.title}
        />
      )}
      
      {/* Related Courses */}
      <div className="container mt-16">
        <h2 className="text-2xl font-semibold mb-6">You Might Also Like</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* This would be populated with actual related courses */}
          <div className="text-center py-10 text-muted-foreground">
            Related courses coming soon...
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading skeleton for CourseDetail
const CourseDetailSkeleton = () => {
  return (
    <div className="min-h-screen pb-16">
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <Skeleton className="h-6 w-20 mb-4" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-24 w-full mb-6" />
              
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-20 mt-2" />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
              
              <Skeleton className="h-10 w-40" />
            </div>
            
            <div className="w-full md:w-2/5 lg:w-1/3">
              <Skeleton className="w-full aspect-video rounded-xl" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mt-12">
        <Skeleton className="h-12 w-full mb-6" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    </div>
  );
};

export default CourseDetailPage; 