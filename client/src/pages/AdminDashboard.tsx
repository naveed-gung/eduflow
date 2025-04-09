import React, { useEffect, useState } from 'react';
import { DashboardStats } from '@/components/DashboardStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAdminCourses } from '@/lib/data/mockCourses';
import { useAuth } from '@/context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowUpRight, 
  Download, 
  FileEdit, 
  Plus, 
  Search,
  Upload, 
  Users,
  Award,
  Trash2,
  MoreHorizontal,
  Eye,
  TrendingUp,
  BarChart2,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CourseForm } from '@/components/CourseForm';
import axios from 'axios';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import api from '@/lib/api';  // Import the API client
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BookOpen } from 'lucide-react';

// Student interface
interface Student {
  id: string;
  name: string;
  email: string;
  date: string;
  courses: number;
  progress: number;
  photoURL?: string;
}

// Course interface
interface Course {
  id: string;
  title: string;
  category: string;
  isPublished: boolean;
  students: number;
  revenue: number;
  thumbnailUrl: string;
  description?: string;
}

// Add these interfaces below the existing ones

interface CoursePerformance {
  name: string;
  students: number;
  completion: number;
}

interface CategoryDistribution {
  name: string;
  value: number;
}

interface DashboardStats {
  totalStudents: number;
  activeCourses: number;
  totalCourses: number;
  avgCompletionRate: number;
  totalCertificates: number;
  totalRevenue: number;
  coursePerformance: CoursePerformance[];
  categoryDistribution: CategoryDistribution[];
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for UI
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeCourses: 0,
    totalCourses: 0,
    avgCompletionRate: 0,
    totalCertificates: 0,
    totalRevenue: 0,
    coursePerformance: [],
    categoryDistribution: []
  });
  
  // Redirect if not logged in or not an admin
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    } else if (user.role !== 'admin') {
      toast.error("You don't have permission to access the admin dashboard");
      navigate('/dashboard/student');
      return;
    }
    
    // Only fetch data if the user is an admin
    fetchCourses();
    fetchDashboardData();
  }, [user, navigate]);
  
  const fetchCourses = async () => {
    if (!user || user.role !== 'admin') return;
    
    try {
      setIsLoading(true);
      
      // Fetch courses
      const coursesResponse = await api.get(`/courses/admin`);

      if (coursesResponse.data.success && coursesResponse.data.courses) {
        setCourses(coursesResponse.data.courses);
      }
      
      // Fetch recent students
      try {
        const studentsResponse = await api.get(`/users/recent-students`);
        
        if (studentsResponse.data.success && studentsResponse.data.students) {
          setRecentStudents(studentsResponse.data.students);
          setStudentCount(studentsResponse.data.totalCount || 0);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          toast.error("Authentication error. Please log in again.");
          localStorage.removeItem('eduflow-token');
          navigate('/signin');
        } else {
          toast.error('Failed to fetch student data');
        }
        setRecentStudents([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Authentication error. Please log in again.");
        localStorage.removeItem('eduflow-token');
        navigate('/signin');
      } else {
        toast.error('Failed to fetch courses from the server');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch admin dashboard data
  const fetchDashboardData = async () => {
    if (!user || user.role !== 'admin') return;
    
    try {
      setIsLoading(true);
      const response = await api.get('/users/admin/dashboard-stats');
      
      if (response.data.success) {
        // Set received stats data
        const receivedStats = response.data.stats;

        // Default placeholder data for charts
        const defaultCoursePerformance = [
          { name: 'React Basics', students: 45, completion: 78 },
          { name: 'Node.js', students: 32, completion: 65 },
          { name: 'Python Fundamentals', students: 28, completion: 82 },
          { name: 'JavaScript', students: 22, completion: 70 },
          { name: 'Data Science', students: 18, completion: 58 }
        ];
        
        const defaultCategoryDistribution = [
          { name: 'Web Development', value: 45 },
          { name: 'Mobile Dev', value: 25 },
          { name: 'Data Science', value: 20 },
          { name: 'UI/UX Design', value: 10 }
        ];

        // Check if coursePerformance data is empty/missing and use default if needed
        const coursePerformance = 
          receivedStats.coursePerformance && 
          receivedStats.coursePerformance.length > 0 
            ? receivedStats.coursePerformance.map(course => ({
                name: course.name || 'Unknown',
                students: course.students || 0,
                completion: course.completion || 0
              })) 
            : defaultCoursePerformance;
        
        // Check if categoryDistribution data is empty/missing and use default if needed
        const categoryDistribution = 
          receivedStats.categoryDistribution && 
          receivedStats.categoryDistribution.length > 0 
            ? receivedStats.categoryDistribution 
            : defaultCategoryDistribution;

        // Set the complete stats object
        setStats({
          ...receivedStats,
          coursePerformance,
          categoryDistribution,
          // Ensure we have a default certificate count (demo certificates)
          totalCertificates: receivedStats.totalCertificates || 24
        });
        
        console.log('Dashboard stats loaded:', {
          coursePerformanceCount: coursePerformance.length,
          categoryDistributionCount: categoryDistribution.length,
          certificatesCount: receivedStats.totalCertificates || 24
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Authentication error. Please log in again.");
        localStorage.removeItem('eduflow-token');
        navigate('/signin');
      } else {
        toast.error('Failed to fetch dashboard statistics');
        
        // Set default mock data for demonstration
        setStats({
          ...stats,
          coursePerformance: [
            { name: 'React Basics', students: 45, completion: 78 },
            { name: 'Node.js', students: 32, completion: 65 },
            { name: 'Python Fundamentals', students: 28, completion: 82 },
            { name: 'JavaScript', students: 22, completion: 70 },
            { name: 'Data Science', students: 18, completion: 58 }
          ],
          categoryDistribution: [
            { name: 'Web Development', value: 45 },
            { name: 'Mobile Dev', value: 25 },
            { name: 'Data Science', value: 20 },
            { name: 'UI/UX Design', value: 10 }
          ],
          // Set demo certificate count
          totalCertificates: 24
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle new course creation
  const handleCourseCreated = async () => {
    setIsFormOpen(false);
    fetchCourses();
  };

  // Handle course edit
  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsEditFormOpen(true);
  };

  // Handle course view
  const handleViewCourse = (course: Course) => {
    navigate(`/courses/${course.id}`);
  };

  // Handle course delete
  const handleDeleteCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete course
  const confirmDeleteCourse = async () => {
    if (!selectedCourse) return;
    
    try {
      const response = await api.delete(`/courses/${selectedCourse.id}`);
      
      if (response.data.success) {
        toast.success('Course deleted successfully');
        // Remove course from state
        setCourses(courses.filter(c => c.id !== selectedCourse.id));
        setIsDeleteDialogOpen(false);
      } else {
        toast.error('Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  // Handle edit course success
  const handleEditSuccess = () => {
    setIsEditFormOpen(false);
    setSelectedCourse(null);
    fetchCourses();
  };

  // Remove student
  const handleRemoveStudent = async (studentId: string) => {
    try {
      const token = localStorage.getItem('eduflow-token');
      if (!token) return;

      const response = await api.delete(`/users/${studentId}`);

      if (response.data.success) {
        toast.success('Student removed successfully');
        // Update the recent students list
        setRecentStudents(recentStudents.filter(student => student.id !== studentId));
        // Decrease the student count
        setStudentCount(prevCount => prevCount - 1);
      } else {
        toast.error(response.data.message || 'Failed to remove student');
      }
    } catch (error) {
      console.error('Error removing student:', error);
      toast.error('An error occurred while removing the student');
    }
  };

  // Filter courses by search query
  const filteredCourses = searchQuery.trim() 
    ? courses.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : courses;

  // Colors for category distribution chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="min-h-screen pb-16">
      {/* Dashboard Header */}
      <div className="bg-muted/30 py-8 sm:py-12">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your courses, students, and platform
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              <Button onClick={() => setIsFormOpen(true)} size="sm" className="h-9 text-xs sm:text-sm">
                <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                New Course
              </Button>
              <Button variant="outline" size="sm" className="h-9 text-xs sm:text-sm" onClick={() => toast.info("Reports feature coming soon!")}>
                <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Reports
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="container mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Show loader or error message if appropriate */}
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-20 bg-muted/40 rounded-md"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            {/* Students */}
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium mb-1">Total Students</p>
                    <h2 className="text-3xl font-bold">{stats.totalStudents || 0}</h2>
                  </div>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Courses */}
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium mb-1">Active Courses</p>
                    <h2 className="text-3xl font-bold">{stats.activeCourses || courses.length || 0}</h2>
                  </div>
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <BookOpen className="w-6 h-6 text-green-600 dark:text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Completion Rate */}
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium mb-1">Avg. Completion</p>
                    <h2 className="text-3xl font-bold">{stats.avgCompletionRate || 0}%</h2>
                  </div>
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-full">
                    <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Certificates */}
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium mb-1">Certificates</p>
                    <h2 className="text-3xl font-bold">{stats.totalCertificates || 0}</h2>
                  </div>
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                    <Award className="w-6 h-6 text-purple-600 dark:text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      {/* Charts */}
      <div className="container mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Course Performance */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
              <CardDescription>Student enrollment and completion rate by course</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.coursePerformance}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="students" name="Students" fill="#8884d8" />
                      <Bar dataKey="completion" name="Completion %" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Category Distribution */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>Distribution of courses by category</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.categoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Management */}
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Course Management</span>
                {!isLoading && (
                  <div className="text-sm font-normal">
                    {filteredCourses.length} courses
                  </div>
                )}
              </CardTitle>
              <CardDescription>Manage your educational content</CardDescription>
              
              {!isLoading && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <div className="relative w-full sm:w-auto flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search courses..." 
                      className="pl-8" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3">Loading courses...</span>
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-10">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No courses found</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => setIsFormOpen(true)}
                  >
                    <Plus className="mr-2 h-3 w-3" />
                    Add Course
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead className="hidden md:table-cell">Category</TableHead>
                        <TableHead className="hidden md:table-cell">Published</TableHead>
                        <TableHead className="text-right">Students</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCourses.map((course) => (
                      <TableRow key={course.id}>
                          <TableCell className="font-medium py-3 truncate max-w-[120px] md:max-w-none">
                            {course.title}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{course.category}</TableCell>
                        <TableCell className="hidden md:table-cell">
                            {course.isPublished ? (
                              <span className="inline-flex bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded-full">
                                Published
                              </span>
                            ) : (
                              <span className="inline-flex bg-amber-500/10 text-amber-500 text-xs px-2 py-1 rounded-full">
                                Draft
                          </span>
                            )}
                        </TableCell>
                        <TableCell className="text-right">{course.students}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleViewCourse(course)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Course
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditCourse(course)}>
                                <FileEdit className="mr-2 h-4 w-4" />
                                  Edit Course
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleDeleteCourse(course)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Recent Students */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Students</span>
                {!isLoading && (
                  <div className="text-sm font-normal">
                    {studentCount} total
                  </div>
                )}
              </CardTitle>
              <CardDescription>
                Recently joined students
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3">Loading students...</span>
                </div>
              ) : recentStudents.length === 0 ? (
                <div className="text-center py-10">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No student data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentStudents.map((student) => (
                  <div 
                    key={student.id}
                      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={student.photoURL} alt={student.name} />
                          <AvatarFallback>
                            {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                          <p className="text-xs mt-1">
                            <span className="text-muted-foreground">Joined: </span>
                            {student.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
                        <div className="text-right text-xs mr-2 hidden sm:block">
                          <p><span className="font-medium">{student.courses}</span> courses</p>
                          <p><span className="font-medium">{student.progress}%</span> avg. progress</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigate(`/admin/students/${student.id}`)}>
                              <Users className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleRemoveStudent(student.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Course Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new course. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <CourseForm 
            onSuccess={handleCourseCreated}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Course Dialog */}
      {selectedCourse && (
        <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>
                Update the course details. Fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            <CourseForm 
              courseData={selectedCourse}
              isEdit={true}
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setIsEditFormOpen(false);
                setSelectedCourse(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCourse?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedCourse(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCourse} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
