import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AIAssistant } from '@/components/AIAssistant';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthProvider';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, BookOpen, Camera, GraduationCap, LoaderCircle, User } from 'lucide-react';
import { toast } from 'sonner';
import { fileToBase64, validateImageFile } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  Edit, 
  Globe, 
  Mail, 
  Phone, 
  PieChart, 
  Shield, 
  Award
} from 'lucide-react';
import api from '@/lib/api';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { role } = useParams<{ role: string }>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Add state for stats
  const [statistics, setStatistics] = useState({
    enrolledCoursesCount: 0,
    completedCoursesCount: 0,
    certificatesCount: 0
  });
  
  // Hidden file input reference
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Redirect if not logged in or accessing wrong profile type
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    } else if (user.role !== role) {
      navigate(`/profile/${user.role}`);
    }
  }, [user, navigate, role]);

  // Initialize form values from user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAvatarPreview(user.avatarUrl || user.photoURL || null);
      
      // Fetch user stats
      fetchUserStats();
    }
  }, [user]);

  // Function to fetch user stats
  const fetchUserStats = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const response = await api.get('/users/student/dashboard-stats');
      
      if (response.data.success) {
        setStatistics({
          enrolledCoursesCount: response.data.stats.enrolledCoursesCount || 0,
          completedCoursesCount: response.data.stats.completedCoursesCount || 0,
          certificatesCount: response.data.stats.certificatesCount || 0
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Error toast is handled by API interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const profileData = {
        name,
        email,
        bio,
        phone,
        location,
        avatarUrl: avatarPreview
      };

      const response = await api.put('/users/profile', profileData);

      // Update local user data
      if (response.data.user) {
        const updatedUser = response.data.user;
        localStorage.setItem('eduflow-user', JSON.stringify(updatedUser));
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error('Error updating profile:', error);
      // Error toast is handled by API interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUploadClick = () => {
    // Trigger hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setUploadError(validation.message || 'Invalid file');
      return;
    }
    
    try {
      setIsLoading(true);
      // Convert file to base64
      const base64Image = await fileToBase64(file);
      setAvatarPreview(base64Image);
      
      // For immediate feedback, save the image right away
      const response = await api.put('/users/avatar', { avatar: base64Image });
      
      // Update local user data
      if (response.data.user) {
        const updatedUser = response.data.user;
        localStorage.setItem('eduflow-user', JSON.stringify(updatedUser));
      }
      
      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error('Error uploading avatar:', error);
      // Error toast is handled by API interceptor
    } finally {
      setIsLoading(false);
      // Clear the input value to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Function to handle avatar removal
  const handleRemoveAvatar = async () => {
    setIsLoading(true);
    setUploadError(null);
    
    try {
      const response = await api.delete('/users/avatar');
      
      // Update local UI
      setAvatarPreview(null);
      
      // Update local user data
      if (response.data.user) {
        const updatedUser = response.data.user;
        localStorage.setItem('eduflow-user', JSON.stringify(updatedUser));
      }
      
      toast.success("Profile picture removed successfully");
    } catch (error) {
      console.error('Error removing avatar:', error);
      // Error toast is handled by API interceptor
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  // Function to get initials from name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen pb-16">
      <AIAssistant />
      
      {/* Profile Header */}
      <div className="bg-muted/30 py-12">
        <div className="container">
          <h1 className="text-4xl font-bold mb-2">
            Your Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and profile
          </p>
        </div>
      </div>
      
      <div className="container mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/3 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="w-28 h-28 rounded-full bg-muted overflow-hidden">
                      {(avatarPreview || user?.avatarUrl || user?.photoURL) ? (
                        <img 
                          src={avatarPreview || user?.avatarUrl || user?.photoURL} 
                          alt={user?.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-semibold">
                          {getInitials(user?.name || '')}
                        </div>
                      )}
                    </div>
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="absolute bottom-0 right-0 rounded-full"
                      onClick={handleAvatarUploadClick}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  
                  {uploadError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{uploadError}</AlertDescription>
                    </Alert>
                  )}
                  
                  {(avatarPreview || user?.avatarUrl || user?.photoURL) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRemoveAvatar}
                      disabled={isLoading}
                      className="mb-4"
                    >
                      Remove Profile Picture
                    </Button>
                  )}
                  
                  <h2 className="text-2xl font-semibold">{user?.name}</h2>
                  <p className="text-muted-foreground mb-2">{user?.email}</p>
                  
                  <Badge variant="outline" className="bg-primary/20 text-primary">
                    {user?.role === 'admin' ? 'Administrator' : 'Student'}
                  </Badge>
                  
                  <div className="grid grid-cols-2 gap-4 w-full mt-8">
                    {user?.role === 'admin' ? (
                      <>
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-primary/20 mx-auto mb-2 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div className="text-2xl font-semibold">36</div>
                          <div className="text-xs text-muted-foreground">Courses Created</div>
                        </div>
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-primary/20 mx-auto mb-2 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="text-2xl font-semibold">524</div>
                          <div className="text-xs text-muted-foreground">Students</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-primary/20 mx-auto mb-2 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div className="text-2xl font-semibold">{statistics.enrolledCoursesCount}</div>
                          <div className="text-xs text-muted-foreground">Enrolled Courses</div>
                        </div>
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-primary/20 mx-auto mb-2 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-primary" />
                          </div>
                          <div className="text-2xl font-semibold">{statistics.certificatesCount}</div>
                          <div className="text-xs text-muted-foreground">Certificates</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Account Info</CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="user-id">User ID</Label>
                  <Input id="user-id" value={user?.id} disabled />
                </div>
                <div>
                  <Label htmlFor="joined-date">Joined Date</Label>
                  <Input id="joined-date" value={user?.enrollmentDate || "Not available"} disabled />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={user?.role} disabled />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:w-2/3">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="profile">Profile Settings</TabsTrigger>
                <TabsTrigger value="account">Account Security</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Tell us about yourself..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          placeholder="+1 (555) 000-0000" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input 
                          id="location" 
                          placeholder="City, Country" 
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>Change your password</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={() => toast.success("Password updated successfully")}>
                        Update Password
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>Add an extra layer of security</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account by enabling two-factor authentication.
                        </p>
                      </div>
                      <Button variant="outline">Enable</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Configure your notification preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Email Notifications</h3>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications about your activity via email
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="email-notifications" className="sr-only">
                            Email Notifications
                          </Label>
                          <Input type="checkbox" id="email-notifications" className="w-5 h-5" />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Course Updates</h3>
                          <p className="text-sm text-muted-foreground">
                            Get notified when new content is added to your enrolled courses
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="course-updates" className="sr-only">
                            Course Updates
                          </Label>
                          <Input type="checkbox" id="course-updates" className="w-5 h-5" defaultChecked />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Marketing</h3>
                          <p className="text-sm text-muted-foreground">
                            Receive updates about new courses and features
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="marketing" className="sr-only">
                            Marketing
                          </Label>
                          <Input type="checkbox" id="marketing" className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
