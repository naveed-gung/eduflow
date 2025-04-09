import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  LogOut, 
  User, 
  BookOpen, 
  LayoutDashboard, 
  Settings,
  Menu,
  Home,
  Award
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  studentOnly?: boolean;
  guestOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    title: 'Home',
    href: '/',
    icon: Home,
  },
  {
    title: 'Courses',
    href: '/courses',
    icon: BookOpen,
  },
  {
    title: 'Student Dashboard',
    href: '/dashboard/student',
    icon: LayoutDashboard,
    studentOnly: true,
  },
  {
    title: 'Admin Dashboard',
    href: '/dashboard/admin',
    icon: LayoutDashboard,
    adminOnly: true,
  },
];

export function MainNav({ className }: React.HTMLAttributes<HTMLElement>) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  
  // Determine if user is guest, student, or admin
  const isGuest = !user;
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';

  const NavigationItems = () => (
    <>
      {navItems.map((item) => {
        // Only show items based on user role
        if ((item.adminOnly && !isAdmin) || 
            (item.studentOnly && !isStudent) || 
            (item.guestOnly && !isGuest)) {
          return null;
        }
        
        return (
          <DropdownMenuItem key={item.href} asChild>
            <Link
              to={item.href}
              className={cn(
                "flex items-center gap-2 w-full p-2 rounded-md hover:bg-accent",
                pathname === item.href && "bg-accent/50 font-medium"
              )}
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              <span>{item.title}</span>
            </Link>
          </DropdownMenuItem>
        );
      })}
    </>
  );
  
  const AuthSection = () => (
    <>
      {isGuest ? (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/signin" className="w-full">
              Sign In
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/signup" className="w-full font-medium">
              Sign Up
            </Link>
          </DropdownMenuItem>
        </>
      ) : (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL || user?.avatarUrl} alt={user?.name} />
                <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                <span className="mt-1 text-xs px-1.5 py-0.5 bg-primary/20 text-primary rounded-full w-fit">
                  {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link to={`/profile/${user?.role}`}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          {user?.role === 'student' && (
            <DropdownMenuItem asChild>
              <Link to="/certificates">
                <Award className="mr-2 h-4 w-4" />
                <span>Certificates</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link to="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => logout()} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground grid place-items-center font-bold text-lg">E</div>
            <span className="hidden sm:inline-block font-bold text-xl">EduFlow</span>
          </Link>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="flex items-center gap-4 text-sm">
              {navItems.map((item) => {
                if ((item.adminOnly && !isAdmin) || 
                    (item.studentOnly && !isStudent) || 
                    (item.guestOnly && !isGuest)) {
                  return null;
                }
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground",
                      pathname === item.href && "text-foreground font-medium"
                    )}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {/* Desktop Auth Section */}
          {!isMobile && isGuest && (
            <div className="flex gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/signin">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
          
          {!isMobile && !isGuest && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    <span className="mt-1 text-xs px-1.5 py-0.5 bg-primary/20 text-primary rounded-full w-fit">
                      {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`/profile/${user?.role}`}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                {user?.role === 'student' && (
                  <DropdownMenuItem asChild>
                    <Link to="/certificates">
                      <Award className="mr-2 h-4 w-4" />
                      <span>Certificates</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Mobile Navigation Hamburger */}
          {isMobile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-[250px] mt-2 animate-scale-in"
                forceMount
              >
                <NavigationItems />
                <AuthSection />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
