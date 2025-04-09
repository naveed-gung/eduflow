import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import api from '@/lib/api';
import { 
  ArrowLeft, 
  Award, 
  BookOpen, 
  Calendar, 
  Clock, 
  Download, 
  Eye, 
  GraduationCap, 
  Mail, 
  MapPin, 
  MoreHorizontal, 
  Phone, 
  User, 
  Users 
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CertificateViewer } from '@/components/CertificateViewer';

// Interface for student data
interface Student {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  photoURL?: string;
  bio?: string;
  phone?: string;
  location?: string;
  enrollmentDate: string;
  role: 'student';
  enrolledCourses: EnrolledCourse[];
  certificates: Certificate[];
}

// Interface for enrolled course
interface EnrolledCourse {
  courseId: {
    _id: string;
    title: string;
    thumbnail: string;
    description: string;
    category: string;
    level: string;
    duration: string;
  };
  progress: number;
  enrollmentDate: string;
  lastAccessed?: string;
}

// Interface for certificate
interface Certificate {
  _id: string;
  courseId: {
    _id: string;
    title: string;
  };
  courseName: string;
  certificateNumber: string;
  issueDate: string;
}

const AdminStudentProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDownloadingData, setIsDownloadingData] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isCertificateViewerOpen, setIsCertificateViewerOpen] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    
    if (user.role !== 'admin') {
      toast.error("You don't have permission to access this page");
      navigate('/');
      return;
    }
    
    fetchStudentData();
  }, [user, navigate, id]);

  // Fetch student data
  const fetchStudentData = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      console.log(`Attempting to fetch student data for ID: ${id}`);
      
      const response = await api.get(`/users/${id}`);
      
      if (response.data.success) {
        console.log('Student data fetched successfully');
        setStudent(response.data.user);
      } else {
        console.error('API returned failure:', response.data);
        toast.error(response.data.message || 'Failed to load student data');
        navigate('/dashboard/admin');
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      
      // Display more detailed error message
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Server response error:', {
          status: error.response.status,
          data: error.response.data
        });
        
        const errorMessage = error.response.data?.message || 
                            `Server error (${error.response.status})`;
        toast.error(`Failed to load student profile: ${errorMessage}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        toast.error('Failed to load student profile: No response from server');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', error.message);
        toast.error(`Failed to load student profile: ${error.message}`);
      }
      
      navigate('/dashboard/admin');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle student removal
  const handleRemoveStudent = async () => {
    if (!student) return;
    
    try {
      setIsLoading(true);
      const response = await api.delete(`/users/${student.id}`);
      
      if (response.data.success) {
        toast.success('Student removed successfully');
        navigate('/dashboard/admin');
      } else {
        toast.error(response.data.message || 'Failed to remove student');
      }
    } catch (error) {
      console.error('Error removing student:', error);
      toast.error('An error occurred while removing the student');
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Download student data as JSON
  const handleDownloadData = () => {
    if (!student) return;
    
    try {
      setIsDownloadingData(true);
      
      // Create a formatted JSON string
      const studentData = JSON.stringify(student, null, 2);
      
      // Create a blob from the JSON string
      const blob = new Blob([studentData], { type: 'application/json' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const a = document.createElement('a');
      a.href = url;
      a.download = `${student.name.replace(/\s+/g, '_')}_data.json`;
      
      // Trigger the download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Student data downloaded successfully');
    } catch (error) {
      console.error('Error downloading data:', error);
      toast.error('Failed to download student data');
    } finally {
      setIsDownloadingData(false);
    }
  };

  // View certificate
  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setIsCertificateViewerOpen(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
          <p>Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertDescription>
            Student not found or you don't have permission to view this profile.
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard/admin')} 
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      {/* Header with back button and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard/admin')}
            size="icon"
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Student Profile</h1>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            disabled={isDownloadingData}
            onClick={handleDownloadData}
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloadingData ? 'Downloading...' : 'Export Data'}
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Remove Student
          </Button>
        </div>
      </div>
      
      {/* Profile overview card */}
      <Card className="mb-8 border shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start gap-4">
              <Avatar className="h-24 w-24 mb-2">
                <AvatarImage src={student.avatarUrl || student.photoURL} alt={student.name} />
                <AvatarFallback className="text-xl">{getInitials(student.name)}</AvatarFallback>
              </Avatar>
              
              <Badge variant="outline" className="px-3 py-1 rounded-full">
                Student
              </Badge>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{student.name}</h2>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" />
                  {student.email}
                </p>
                
                {student.phone && (
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4" />
                    {student.phone}
                  </p>
                )}
                
                {student.location && (
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4" />
                    {student.location}
                  </p>
                )}
                
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  Joined {formatDate(student.enrollmentDate)}
                </p>
              </div>
              
              {student.bio && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-1">Bio</h3>
                  <p className="text-sm text-muted-foreground">{student.bio}</p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border rounded-lg p-4 md:w-64">
              <div className="text-center p-2">
                <p className="text-2xl font-bold text-primary">
                  {student.enrolledCourses.length}
                </p>
                <p className="text-xs text-muted-foreground">Enrolled Courses</p>
              </div>
              
              <div className="text-center p-2">
                <p className="text-2xl font-bold text-amber-500">
                  {student.enrolledCourses.filter(c => c.progress === 100).length}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              
              <div className="text-center p-2">
                <p className="text-2xl font-bold text-green-500">
                  {student.certificates.length}
                </p>
                <p className="text-xs text-muted-foreground">Certificates</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs for different sections */}
      <Tabs defaultValue="courses" className="mb-8" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="courses" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="certificates" className="gap-2">
            <Award className="h-4 w-4" />
            Certificates
          </TabsTrigger>
        </TabsList>
        
        {/* Courses Tab */}
        <TabsContent value="courses" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Courses</CardTitle>
              <CardDescription>
                Courses this student is currently enrolled in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {student.enrolledCourses.length === 0 ? (
                <div className="text-center py-10">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No courses enrolled</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead className="hidden md:table-cell">Category</TableHead>
                        <TableHead className="hidden md:table-cell">Enrolled</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.enrolledCourses.map((course) => (
                        <TableRow key={course.courseId._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded overflow-hidden flex-shrink-0 bg-muted">
                                {course.courseId.thumbnail && (
                                  <img
                                    src={course.courseId.thumbnail}
                                    alt={course.courseId.title}
                                    className="h-full w-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="font-medium truncate max-w-[150px] md:max-w-full">
                                {course.courseId.title}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {course.courseId.category || course.courseId.level}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatDate(course.enrollmentDate)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={course.progress} className="h-2 flex-grow" />
                              <span className="text-xs font-medium w-8 text-right">
                                {course.progress}%
                              </span>
                            </div>
                            {course.progress === 100 && (
                              <Badge className="mt-1 text-xs bg-green-500 hover:bg-green-600">
                                Completed
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => navigate(`/course-detail/${course.courseId._id}`)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Course
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
        </TabsContent>
        
        {/* Certificates Tab */}
        <TabsContent value="certificates" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Certificates</CardTitle>
              <CardDescription>
                Certificates earned by this student
              </CardDescription>
            </CardHeader>
            <CardContent>
              {student.certificates.length === 0 ? (
                <div className="text-center py-10">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No certificates earned yet</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Certificate ID</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead className="hidden md:table-cell">Issue Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.certificates.map((certificate) => (
                        <TableRow key={certificate._id}>
                          <TableCell className="font-mono text-xs">
                            {certificate.certificateNumber}
                          </TableCell>
                          <TableCell>
                            {certificate.courseId?.title || certificate.courseName}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatDate(certificate.issueDate)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewCertificate(certificate)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this student? This action cannot be undone.
              All their enrollment data and certificates will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveStudent} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Certificate Viewer */}
      {selectedCertificate && (
        <CertificateViewer
          isOpen={isCertificateViewerOpen}
          onClose={() => setIsCertificateViewerOpen(false)}
          certificate={selectedCertificate}
          userName={student.name}
        />
      )}
    </div>
  );
};

export default AdminStudentProfilePage; 