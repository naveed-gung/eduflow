import React from 'react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Clock, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CourseProps {
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
}

interface CourseCardProps {
  course: CourseProps;
  loading?: boolean;
  variant?: 'default' | 'horizontal';
  className?: string;
}

export function CourseCard({ course, loading = false, variant = 'default', className }: CourseCardProps) {
  if (loading) {
    return (
      <div className={cn(
        "course-card relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200",
        variant === 'horizontal' ? "flex gap-4" : "flex flex-col",
        "animate-pulse shimmer-effect",
        className
      )}>
        <div className={cn(
          "bg-muted",
          variant === 'horizontal' ? "w-1/3 h-full" : "w-full h-48"
        )}></div>
        <div className="p-4 flex-1 space-y-3">
          <div className="h-6 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="flex justify-between">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link 
      to={`/course-detail/${course.id}`}
      className={cn(
        "course-card card-glow relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200",
        "hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1",
        variant === 'horizontal' ? "flex gap-4" : "flex flex-col",
        "block",
        className
      )}
      data-title={course.title}
    >
      <div className={cn(
        "relative overflow-hidden",
        variant === 'horizontal' ? "w-1/3" : "w-full h-48"
      )}>
        <img 
          src={course.thumbnailUrl} 
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {course.isPopular && (
          <Badge variant="secondary" className="absolute top-2 left-2">
            Popular
          </Badge>
        )}
        {course.isNew && (
          <Badge variant="default" className="absolute top-2 left-2 bg-primary">
            New
          </Badge>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <PlayCircle className="w-12 h-12 text-primary" />
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" className="text-xs px-2 py-0">
              {course.category}
            </Badge>
          </div>
          
          <h3 className="text-lg font-semibold line-clamp-2 mb-2">
            {course.title}
          </h3>
          
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {course.description}
          </p>
        </div>
        
        <div className="flex items-center text-xs text-muted-foreground gap-3 mt-auto">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{course.lessonsCount} lessons</span>
          </div>
        </div>
        
        {course.progress !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-1.5" />
          </div>
        )}
      </div>
    </Link>
  );
}
