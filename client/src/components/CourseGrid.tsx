import React, { useState } from 'react';
import { CourseCard, CourseProps } from '@/components/CourseCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

interface CourseGridProps {
  title?: string;
  courses: CourseProps[];
  loading?: boolean;
  searchable?: boolean;
  variant?: 'default' | 'compact';
  className?: string;
}

export function CourseGrid({
  title,
  courses,
  loading = false,
  searchable = false,
  variant = 'default',
  className,
}: CourseGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter courses based on search query
  const filteredCourses = searchQuery.trim() !== '' 
    ? courses.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : courses;
  
  // If no courses found after filtering
  const noCoursesFound = searchQuery.trim() !== '' && filteredCourses.length === 0;
  
  // Show empty state with toast if no courses found
  React.useEffect(() => {
    if (noCoursesFound) {
      toast.info("No courses found matching your search criteria");
    }
  }, [noCoursesFound]);

  return (
    <div className={className}>
      {title && (
        <h2 className="text-2xl font-semibold mb-6">{title}</h2>
      )}
      
      {searchable && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="search"
            placeholder="Search courses..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}
      
      <div className={`grid grid-cols-1 ${variant === 'compact' 
        ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4' 
        : 'sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'}`}>
        {loading ? (
          // Skeleton loading
          Array.from({ length: 6 }).map((_, index) => (
            <CourseCard
              key={`skeleton-${index}`}
              loading={true}
              course={{} as CourseProps}
            />
          ))
        ) : filteredCourses.length > 0 ? (
          // Show actual courses
          filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))
        ) : (
          // No courses found state
          <div className="col-span-full py-12 sm:py-20 text-center px-4">
            <div className="mx-auto mb-4 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-muted/30 flex items-center justify-center">
              <Search className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
