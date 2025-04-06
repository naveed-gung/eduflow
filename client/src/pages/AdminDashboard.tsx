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
  Trash2
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

      const response = await axios.delete(`${API_BASE_URL}/users/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

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
      <div className="bg-muted/30 py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage courses, students, and monitor platform performance
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Course
              </Button>
              <Button variant="outline" onClick={() => navigate('/admin/certificates')}>
                <Award className="mr-2 h-4 w-4" />
                Certificates
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Reports
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mt-8">
        {/* Stats Overview */}
        <DashboardStats role="admin" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Course Management */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Course Management</CardTitle>
                <CardDescription>Manage and track your courses</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
                <Button size="sm" onClick={() => setIsFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
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
              
              <div className="rounded-md border">
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
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin h-6 w-6 text-primary mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Loading courses...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredCourses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          {searchQuery.trim() 
                            ? "No courses found matching your search criteria" 
                            : "No courses available. Create your first course to get started."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCourses.slice(0, 5).map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded overflow-hidden bg-muted">
                              <img 
                                src={course.thumbnailUrl} 
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="truncate max-w-[150px]">{course.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{course.category}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            course.isPublished 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' 
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500'
                          }`}>
                            {course.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{course.students}</TableCell>
                          <TableCell className="text-right">${course.revenue || 0}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <span className="sr-only">Open menu</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="12" cy="5" r="1" />
                                  <circle cx="12" cy="19" r="1" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEditCourse(course)}>
                                <FileEdit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewCourse(course)}>
                                <ArrowUpRight className="mr-2 h-4 w-4" />
                                View
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
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm" onClick={() => navigate('/admin/courses')}>
                  View All Courses
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Students */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Students</CardTitle>
              <CardDescription>New students who joined recently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentStudents.length > 0 ? (
                  recentStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-medium text-lg">
                          {student.name[0]}
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-2">
                          <p className="text-sm font-medium">{student.courses} courses</p>
                          <p className="text-xs text-muted-foreground">{student.date}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <span className="sr-only">Student actions</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="12" cy="5" r="1" />
                                <circle cx="12" cy="19" r="1" />
                              </svg>
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
