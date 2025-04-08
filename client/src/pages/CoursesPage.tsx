import React, { useState, useEffect } from 'react';
import { CourseGrid } from '@/components/CourseGrid';
import { Input } from "@/components/ui/input";
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthProvider';

// Number of courses per page
const COURSES_PER_PAGE = 9;

// Course type definition
interface CourseType {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnailUrl: string;
  category: string;
  duration: string;
  lessonsCount: number;
  progress?: number;
  isPopular?: boolean;
  isNew?: boolean;
  isEnrolled?: boolean;
}

const CoursesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  
  // Fetch user's enrolled courses
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!isAuthenticated || !user) {
        return;
      }
      
      try {
        const response = await api.get('/users/profile');
        if (response.data.success) {
          const enrolledIds = response.data.user.enrolledCourses.map((course: any) => 
            course.courseId._id || course.courseId
          );
          setEnrolledCourseIds(enrolledIds);
        }
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
      }
    };
    
    fetchEnrolledCourses();
  }, [isAuthenticated, user]);
  
  // Fetch courses from API with pagination
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/courses`, {
          params: {
            page: currentPage,
            limit: COURSES_PER_PAGE,
            search: searchQuery.trim() !== '' ? searchQuery : undefined
          }
        });
        
        if (response.data.success) {
          // Format courses to match the CourseProps interface
          const formattedCourses = response.data.courses.map((course: any) => ({
            id: course._id,
            title: course.title,
            description: course.description,
            instructor: course.instructorName || 'Instructor',
            thumbnailUrl: course.thumbnail,
            category: course.level,
            duration: course.duration,
            lessonsCount: course.modules?.reduce((acc: number, module: any) => 
              acc + (module.lessons?.length || 0), 0) || 0,
            isPopular: course.studentsCount > 5,
            isNew: new Date(course.createdAt || Date.now()).getTime() > Date.now() - (14 * 24 * 60 * 60 * 1000), // 14 days
            isEnrolled: enrolledCourseIds.includes(course._id)
          }));
          
          setCourses(formattedCourses);
          setTotalPages(response.data.totalPages || 1);
          setTotalCourses(response.data.totalCount || 0);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        // Toast error already handled by API interceptor
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, [currentPage, searchQuery, enrolledCourseIds]);
  
  // Handle search with debounce
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Generate pagination array
  const getPaginationArray = () => {
    const paginationArray = [];
    const maxPagesShown = 5;
    
    if (totalPages <= maxPagesShown) {
      // Show all pages if total pages is less than maxPagesShown
      for (let i = 1; i <= totalPages; i++) {
        paginationArray.push(i);
      }
    } else {
      // Calculate start and end page numbers
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesShown / 2));
      let endPage = startPage + maxPagesShown - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPagesShown + 1);
      }
      
      // Add first page
      paginationArray.push(1);
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        paginationArray.push('ellipsis1');
      }
      
      // Add middle pages
      for (let i = Math.max(2, startPage); i <= Math.min(totalPages - 1, endPage); i++) {
        paginationArray.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        paginationArray.push('ellipsis2');
      }
      
      // Add last page if not already included
      if (totalPages > 1) {
        paginationArray.push(totalPages);
      }
    }
    
    return paginationArray;
  };
  
  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <div className="bg-muted/30 py-12">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">Explore Courses</h1>
          <p className="text-muted-foreground max-w-2xl">
            Discover our comprehensive selection of courses designed to help you master new skills and advance your career.
          </p>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="container mt-8">
        <div className="relative mb-6 max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="search"
            placeholder="Search courses..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary mr-4" />
            <p className="text-lg">Loading courses...</p>
          </div>
        )}
        
        {/* Results count */}
        {!isLoading && (
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {courses.length} of {totalCourses} courses
            {searchQuery.trim() !== '' && ` matching "${searchQuery}"`}
          </div>
        )}
        
        {/* Course Cards */}
        {!isLoading && (
        <CourseGrid 
            courses={courses}
            searchable={false} // We're handling search at the page level
          />
        )}
        
        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {getPaginationArray().map((page, index) => (
                page === 'ellipsis1' || page === 'ellipsis2' ? (
                  <div key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                    &#8230;
                  </div>
                ) : (
                  <Button
                    key={`page-${page}`}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => handlePageChange(page as number)}
                    className="w-9 h-9"
                  >
                    {page}
                  </Button>
                )
              ))}
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
