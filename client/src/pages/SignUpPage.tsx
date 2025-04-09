import React, { useEffect, useRef } from 'react';
import { SignUpForm } from '@/components/SignUpForm';
import { AIAssistant } from '@/components/AIAssistant';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';

const SignUpPage = () => {
  const { isAuthenticated, user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Log authentication state (for debugging)
  useEffect(() => {
    console.log('SignUpPage - Auth State:', { isAuthenticated, user });
  }, [isAuthenticated, user]);
  
  // Interactive gradient background effect - similar to SignInPage but with different colors
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let mouse = {
      x: canvas.width / 2,
      y: canvas.height / 2
    };
    
    // Track mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Create gradient animation
    const animate = () => {
      // Create radial gradient based on mouse position
      const gradient = ctx.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, canvas.width * 0.7
      );
      
      // Add color stops - use a different color palette than sign in
      const hue1 = (mouse.x / canvas.width) * 60 + 260; // purple range
      const hue2 = (mouse.y / canvas.height) * 60 + 320; // pink/magenta range
      
      gradient.addColorStop(0, `hsla(${hue1}, 80%, 60%, 0.3)`);
      gradient.addColorStop(0.5, `hsla(${hue2}, 70%, 40%, 0.1)`);
      gradient.addColorStop(1, 'rgba(10, 10, 30, 0)');
      
      // Fill background
      ctx.fillStyle = 'rgba(10, 10, 30, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Apply gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add grid lines for a tech feel
      ctx.strokeStyle = 'rgba(255, 84, 112, 0.05)'; // Pink lines instead of teal
      ctx.lineWidth = 1;
      
      // Vertical lines
      for (let i = 0; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let i = 0; i < canvas.height; i += 30) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
      
      requestAnimationFrame(animate);
    };
    
    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    animate();
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <AIAssistant />
      
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full -z-10"
      />
      
      <div className="flex-1 flex flex-col sm:flex-row">
        <div className="sm:w-1/2 bg-muted/10 backdrop-blur-lg p-8 sm:p-16 flex items-center justify-center order-2 sm:order-1">
          <div className="max-w-md">
            <div className="glass-panel rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">Join a Community of Learners</h2>
              <p className="text-muted-foreground mb-4">
                Gain access to expert-led courses, earn certificates, and advance your career.
              </p>
              <ul className="space-y-3">
                {['Access to 1,000+ courses', 'Learn at your own pace', 'Certificate of completion'].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3 w-3 text-primary"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="sm:w-1/2 flex flex-col justify-center p-8 sm:p-16 order-1 sm:order-2">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground grid place-items-center font-bold text-lg">E</div>
              <span className="font-bold text-xl">EduFlow</span>
            </Link>
          </div>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create an account</h1>
            <p className="text-muted-foreground">
              Enter your details to start your learning journey
            </p>
          </div>
          
          <SignUpForm />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
