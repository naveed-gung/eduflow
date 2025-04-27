
import React from 'react';
import { HeroSection } from '@/components/HeroSection';
import { CourseGrid } from '@/components/CourseGrid';
import { CourseCard } from '@/components/CourseCard';
import { Button } from '@/components/ui/button';
import { AIAssistant } from '@/components/AIAssistant';
import { ArrowRight, CheckCheck, BookOpen, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFeaturedCourses } from '@/lib/data/mockCourses';

const Index = () => {
  const featuredCourses = getFeaturedCourses();
  
  return (
    <div className="min-h-screen">
      <AIAssistant />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Featured Courses Section */}
      <section className="py-20 container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Featured Courses</h2>
            <p className="text-muted-foreground">Discover our most popular and latest courses</p>
          </div>
          <Button asChild variant="ghost" className="mt-4 md:mt-0">
            <Link to="/courses" className="gap-1">
              View all courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Why Choose EduFlow</h2>
            <p className="text-muted-foreground">
              Our platform offers a unique learning experience with cutting-edge features designed to accelerate your education journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full grid place-items-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive Courses</h3>
              <p className="text-muted-foreground">
                Engage with dynamic content that adapts to your learning style and pace.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full grid place-items-center mx-auto mb-4">
                <CheckCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
              <p className="text-muted-foreground">
                Monitor your advancement with detailed analytics and personalized insights.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full grid place-items-center mx-auto mb-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Recognized Certificates</h3>
              <p className="text-muted-foreground">
                Earn industry-recognized credentials to showcase your new skills.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 container">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between">
          <div className="max-w-lg mb-8 md:mb-0">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to start learning?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of students who are already mastering new skills and advancing their careers with EduFlow.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg">
                <Link to="/courses">Explore Courses</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/signup">Sign Up Free</Link>
              </Button>
            </div>
          </div>
          
          <div className="relative w-full max-w-xs">
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-eduflow-pink/20 rounded-full blur-xl"></div>
            <div className="relative h-64 w-64 mx-auto">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary via-primary to-accent/50 animate-pulse-glow"></div>
              <div className="absolute inset-4 rounded-full bg-background flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">5K+</div>
                  <div className="text-sm text-muted-foreground">Active students</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
