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
  Eye
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Student interface
interface Student {
  id: string;
  name: string;
  email: string;
  date: string;
  courses: number;
  progress: number;
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
  
  // Redirect if not logged in or not an admin
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    } else if (user.role !== 'admin') {
      navigate('/dashboard/student');
    }
  }, [user, navigate]);
  
  // Fetch courses from API on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
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
        // Use empty array if API fails
        setRecentStudents([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses from the server');
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
              <Button variant="outline" onClick={() => navigate('/admin/certificates')} size="sm" className="h-9 text-xs sm:text-sm">
                <Award className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Certificates
              </Button>
              <Button variant="outline" size="sm" className="h-9 text-xs sm:text-sm">
                <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Reports
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mt-6 sm:mt-8">
        {/* Stats Overview */}
        <DashboardStats role="admin" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
          {/* Course Management */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle>Course Management</CardTitle>
                <CardDescription>Manage and track your courses</CardDescription>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" className="text-xs">
                  <Upload className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Import
                </Button>
                <Button size="sm" onClick={() => setIsFormOpen(true)} className="text-xs flex-1 sm:flex-initial">
                  <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Add Course
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search courses..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead className="hidden md:table-cell">Category</TableHead>
                      <TableHead className="hidden md:table-cell">Published</TableHead>
                      <TableHead className="text-right">Students</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      // Loading skeleton rows
                      [1, 2, 3].map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TableCell className="font-medium py-3">
                            <div className="h-4 bg-muted rounded w-4/5 animate-pulse"></div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="h-4 bg-muted rounded w-1/3 ml-auto animate-pulse"></div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="h-4 bg-muted rounded w-1/3 ml-auto animate-pulse"></div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="h-8 bg-muted rounded w-8 ml-auto animate-pulse"></div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredCourses.length > 0 ? (
                      filteredCourses.map((course) => (
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
                          <TableCell className="text-right">${course.revenue.toFixed(2)}</TableCell>
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
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          No courses found. Create your first course to get started!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Students */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle>Recent Students</CardTitle>
                <CardDescription>New students that joined recently</CardDescription>
              </div>
              <div className="w-full sm:w-auto">
                <Input 
                  placeholder="Search students..." 
                  className="w-full"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentStudents.length > 0 ? (
                  recentStudents.map((student) => (
                  <div 
                    key={student.id}
                      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                        <Avatar>
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
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No students data available.
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center mt-8">
                <div className="text-sm text-muted-foreground">
                  Showing {recentStudents.length} of {studentCount} students
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/admin/students')}>
                  <Users className="mr-2 h-4 w-4" />
                  All Students
                </Button>
              </div>
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
