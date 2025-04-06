import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, BookOpen, Award, CheckCircle, ExternalLink, Play, User, Users, Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthProvider';
import api from '@/lib/api';

interface Lesson {
  _id: string;
  title: string;
  type: string;
  duration: number;
  order: number;
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
  const [currentProgress, setCurrentProgress] = useState(0);
  
  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      
      try {
        // Fetch course details
        const response = await api.get(`/courses/${id}`);
        setCourse(response.data);
        
        // Check if user is enrolled
        if (user) {
          const userResponse = await api.get(`/users/profile`);
          
          const enrolledCourses = userResponse.data.enrolledCourses || [];
          const isAlreadyEnrolled = enrolledCourses.some(course => course.courseId === id);
          setIsEnrolled(isAlreadyEnrolled);
          
          if (isAlreadyEnrolled) {
            const userCourse = enrolledCourses.find(course => course.courseId === id);
            if (userCourse) {
              setCurrentProgress(userCourse.progress);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        toast.error('Failed to load course details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourse();
  }, [id, navigate, isAuthenticated, user]);
  
  const handleEnrollCourse = async () => {
    if (!user) {
      navigate('/signin', { state: { from: `/course-detail/${id}` } });
      return;
    }
    
    try {
      setIsEnrolling(true);
      
      const response = await api.post(`/courses/enroll/${id}`);
      
      setIsEnrolled(true);
      toast.success('Successfully enrolled in the course!');
      
      // Update progress
      const completeCourseResponse = await api.post(
        `/courses/complete/${id}`,
        { progress: 0 }
      );
      
      // Update user profile to get updated enrolled courses
      const updatedUserResponse = await api.get(`/users/profile`);
      
      // Update local progress state
      setCurrentProgress(0);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in the course');
    } finally {
      setIsEnrolling(false);
    }
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
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/5 dark:to-secondary/5 py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <Badge variant="outline" className="mb-4">
                {course.level}
              </Badge>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              
              <p className="text-muted-foreground mb-6">
                {course.description}
              </p>
              
              <div className="flex items-center gap-4 mb-6">
                <Avatar>
                  <AvatarImage src={course.instructor?.photoURL} />
                  <AvatarFallback>{course.instructorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{course.instructorName}</p>
                  <p className="text-xs text-muted-foreground">Instructor</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{course.duration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {course.modules.reduce((acc, module) => acc + module.lessons.length, 0)} lessons
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{course.studentsCount} students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{course.level}</span>
                </div>
              </div>
              
              {isEnrolled ? (
                <Button className="w-full sm:w-auto">
                  <Play className="mr-2 h-4 w-4" /> Continue Learning
                </Button>
              ) : (
                <Button 
                  className="w-full sm:w-auto"
                  onClick={handleEnrollCourse}
                  disabled={isEnrolling}
                >
                  {isEnrolling ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" /> Enrolling...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" /> Enroll Now
                      {course.price > 0 ? ` - $${course.price.toFixed(2)}` : ' - Free'}
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <div className="w-full md:w-2/5 lg:w-1/3">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full aspect-video object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course Content */}
      <div className="container mt-12">
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
                    <div className="bg-muted/40 p-4 rounded-t-lg">
                      <h3 className="font-medium">
                        Module {index + 1}: {module.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {module.lessons.length} lessons
                      </p>
                    </div>
                    <div className="divide-y">
                      {module.lessons.map((lesson) => (
                        <div 
                          key={lesson._id} 
                          className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Play className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{lesson.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {lesson.duration} mins • {lesson.type}
                              </p>
                            </div>
                          </div>
                          {!isEnrolled && (
                            <Badge variant="outline">
                              <Lock className="w-3 h-3 mr-1" /> Preview
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                {!isEnrolled && (
                  <Button onClick={handleEnrollCourse}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Enroll Now
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.learningPoints?.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                      <span>{point}</span>
                    </li>
                  )) || (
                    <li className="text-muted-foreground">No learning points specified for this course.</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="instructor" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Meet Your Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={course.instructor?.photoURL} />
                    <AvatarFallback className="text-2xl">{course.instructorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{course.instructorName}</h3>
                    <p className="text-muted-foreground mb-4">
                      Professional instructor with expertise in {course.category}
                    </p>
                    <Button variant="outline" size="sm">
                      <User className="mr-2 h-4 w-4" /> View Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
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