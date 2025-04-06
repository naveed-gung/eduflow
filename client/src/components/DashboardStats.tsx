import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart,
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Clock, Gauge, GraduationCap, TrendingUp, Trophy, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthProvider';
import api from '@/lib/api';  // Import the API client

interface DashboardStatsProps {
  role: 'admin' | 'student';
  className?: string;
}

interface StudentStats {
  enrolledCourses: number;
  completedCourses: number;
  certificatesEarned: number;
  averageScore: number;
  weeklyProgress: { name: string; hours: number }[];
  courseProgress: { name: string; value: number }[];
  totalLearningTime?: number;
}

interface AdminStats {
  totalStudents: number;
  activeCourses: number;
  completionRate: number;
  totalRevenue: number;
  coursePerformance: { name: string; students: number; completion: number }[];
  categoryDistribution: { name: string; value: number }[];
}

const COLORS = ['#00ebc7', '#5d4d7a', '#ff5470', '#fec6a1'];

export function DashboardStats({ role, className }: DashboardStatsProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [studentStats, setStudentStats] = useState<StudentStats>({
    enrolledCourses: 0,
    completedCourses: 0,
    certificatesEarned: 0,
    averageScore: 0,
    weeklyProgress: [
      { name: 'Mon', hours: 0 },
      { name: 'Tue', hours: 0 },
      { name: 'Wed', hours: 0 },
      { name: 'Thu', hours: 0 },
      { name: 'Fri', hours: 0 },
      { name: 'Sat', hours: 0 },
      { name: 'Sun', hours: 0 },
    ],
    courseProgress: [],
    totalLearningTime: 0
  });
  
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalStudents: 0,
    activeCourses: 0,
    completionRate: 0,
    totalRevenue: 0,
    coursePerformance: [],
    categoryDistribution: []
  });
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        const endpoint = role === 'admin' 
          ? '/users/admin/dashboard-stats' 
          : '/users/student/dashboard-stats';
        
        const response = await api.get(endpoint);
        
        if (response.data.success) {
          if (role === 'admin') {
            setAdminStats(response.data.stats);
          } else {
            setStudentStats(response.data.stats);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [role]);

  // Use either the fetched data or fallbacks
  const stats = role === 'admin' 
    ? adminStats
    : studentStats;
      
  return (
    <div className={cn("space-y-4 sm:space-y-6", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {role === 'admin' ? (
          // Admin stat cards
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl sm:text-3xl font-bold">{stats.totalStudents}</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-full grid place-items-center">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  <span className="text-green-500 mr-1">↑ 12%</span> from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl sm:text-3xl font-bold">{stats.activeCourses}</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-eduflow-teal/20 rounded-full grid place-items-center">
                    <BookIcon className="h-4 w-4 sm:h-5 sm:w-5 text-eduflow-teal" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  <span className="text-green-500 mr-1">↑ 8%</span> from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl sm:text-3xl font-bold">{stats.completionRate}%</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-full grid place-items-center">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  </div>
                </div>
                <Progress value={stats.completionRate} className="h-1.5 mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl sm:text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent/20 rounded-full grid place-items-center">
                    <DollarSignIcon className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  <span className="text-green-500 mr-1">↑ 23%</span> from last month
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          // Student stat cards
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{stats.enrolledCourses}</div>
                  <div className="w-10 h-10 bg-primary/20 rounded-full grid place-items-center">
                    <BookIcon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {stats.completedCourses} completed
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Certificates Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{stats.certificatesEarned}</div>
                  <div className="w-10 h-10 bg-eduflow-pink/20 rounded-full grid place-items-center">
                    <Trophy className="h-5 w-5 text-eduflow-pink" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Great achievement!
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{stats.averageScore}%</div>
                  <div className="w-10 h-10 bg-eduflow-teal/20 rounded-full grid place-items-center">
                    <Gauge className="h-5 w-5 text-eduflow-teal" />
                  </div>
                </div>
                <Progress value={stats.averageScore} className="h-1.5 mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Learning Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{stats.totalLearningTime || 0}</div>
                  <div className="w-10 h-10 bg-accent/20 rounded-full grid place-items-center">
                    <Clock className="h-5 w-5 text-accent" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Hours this week
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      {/* Charts section */}
        {role === 'admin' ? (
          // Admin charts
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Course Performance</CardTitle>
              </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.coursePerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      fontSize={12}
                      tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                    />
                    <YAxis yAxisId="left" orientation="left" stroke="#ff5470" />
                    <YAxis yAxisId="right" orientation="right" stroke="#00ebc7" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="students" fill="#ff5470" name="Students" />
                    <Bar yAxisId="right" dataKey="completion" fill="#00ebc7" name="Completion %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
          <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="h-[300px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.categoryDistribution}
                        cx="50%"
                        cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                        dataKey="value"
                      nameKey="name"
                      >
                        {stats.categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                {stats.categoryDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs truncate">{item.name}</span>
                  </div>
                ))}
              </div>
              </CardContent>
            </Card>
        </div>
        ) : (
          // Student charts
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="col-span-1">
              <CardHeader>
              <CardTitle>Weekly Progress</CardTitle>
              </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <div className="h-[250px] sm:h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                      <YAxis />
                    <Tooltip />
                    <Bar dataKey="hours" fill="#00ebc7" name="Hours" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
          <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Course Progress</CardTitle>
              </CardHeader>
            <CardContent>
              <div className="h-[250px] sm:h-[300px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.courseProgress}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                    >
                      {stats.courseProgress.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                    </div>
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                {stats.courseProgress.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs truncate">{item.name}</span>
                  </div>
                ))}
              </div>
              </CardContent>
            </Card>
        </div>
        )}
    </div>
  );
}

// Custom icons
const BookIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>
);

const DollarSignIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
