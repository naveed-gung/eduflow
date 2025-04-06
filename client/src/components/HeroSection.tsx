
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function HeroSection({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Interactive background animation effect
  useEffect(() => {
    // This is a simplified version - in a real implementation, we'd use Three.js
    // but for now we'll use canvas 2D for a particle effect
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const particles: {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
    }[] = [];
    
    const createParticles = () => {
      const particleCount = 50;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: `rgba(0, 235, 199, ${Math.random() * 0.5 + 0.2})`
        });
      }
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Wrap particles around edges
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;
        if (p.y > canvas.height) p.y = 0;
        if (p.y < 0) p.y = canvas.height;
      });
      
      requestAnimationFrame(animate);
    };
    
    // Handle resize
    const handleResize = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
        
        // Recreate particles for new size
        particles.length = 0;
        createParticles();
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    createParticles();
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden py-20 md:py-32 grid-pattern",
        className
      )}
    >
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      
      <div className="relative container z-10 grid gap-8 md:grid-cols-2 items-center">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              <span>The future of learning is here</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Learn without <br />
              <span className="bg-gradient-to-r from-primary to-eduflow-pink bg-clip-text text-transparent">
                Limits
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Unlock your potential with our cutting-edge online courses.
              Learn at your own pace and transform your career.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="gap-1">
              <Link to="/courses">
                Explore Courses
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/signup">
                Join for Free
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div 
                  key={i} 
                  className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center font-medium"
                >
                  {i}
                </div>
              ))}
            </div>
            <span>Join over 5,000+ students already learning</span>
          </div>
        </div>
        
        <div className="glass-panel rounded-2xl p-1">
          {/* This would be a 3D model with Three.js in the real implementation */}
          <div className="relative aspect-[5/3] rounded-xl overflow-hidden bg-eduflow-purple-light">
            <div className="absolute inset-0 bg-gradient-to-br from-eduflow-teal/30 via-transparent to-eduflow-pink/30 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-primary/30 backdrop-blur-md flex items-center justify-center animate-float">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-primary-foreground">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Glowing orbs for effect */}
      <div className="absolute top-1/4 left-1/4 w-60 h-60 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-eduflow-pink/10 rounded-full blur-3xl -z-10 animate-pulse" />
    </div>
  );
}
