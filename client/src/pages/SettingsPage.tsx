import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AIAssistant } from '@/components/AIAssistant';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthProvider';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Slider } from '@/components/ui/slider';
import api from '@/lib/api';

const SettingsPage = () => {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Appearance settings
  const [showAIAssistant, setShowAIAssistant] = useState(true);
  const [selectedAccent, setSelectedAccent] = useState('#00ebc7');
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    'course-updates': true,
    'comments-replies': true,
    'assignment-due': true,
    'system-announcements': true,
    'marketing-emails': false
  });
  
  // Accessibility settings
  const [textSize, setTextSize] = useState([2]);
  const [animationSpeed, setAnimationSpeed] = useState([2]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  
  // Admin settings
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [apiAccess, setApiAccess] = useState(true);
  const [emailVerification, setEmailVerification] = useState(true);
  const [platformName, setPlatformName] = useState('EduFlow');

  // Load user preferences on component mount
  useEffect(() => {
    if (user?.preferences) {
      // This would be expanded in a real implementation to load all settings
      setShowAIAssistant(user.preferences.showAIAssistant !== false);
    }
  }, [user]);

  const handleSaveAppearance = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('eduflow-token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const updatedPreferences = {
        showAIAssistant,
        accentColor: selectedAccent
      };

      const response = await api.put(`/users/preferences`, { preferences: updatedPreferences });

      if (response.data.success) {
        // Update local user state
        if (response.data.user) {
          localStorage.setItem('eduflow-user', JSON.stringify(response.data.user));
          setUser(response.data.user);
        }
        toast.success("Appearance settings saved");
      }
    } catch (error) {
      console.error('Error saving appearance settings:', error);
      toast.error("Failed to save appearance settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('eduflow-token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await api.put(`/users/preferences`, { preferences: { notifications } });

      if (response.data.success) {
        if (response.data.user) {
          localStorage.setItem('eduflow-user', JSON.stringify(response.data.user));
          setUser(response.data.user);
        }
        toast.success("Notification settings saved");
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error("Failed to save notification settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAccessibility = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('eduflow-token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const accessibilityPreferences = {
        textSize: textSize[0],
        animationSpeed: animationSpeed[0],
        reducedMotion,
        highContrast
      };

      const response = await api.put(`/users/preferences`, { preferences: { accessibility: accessibilityPreferences } });

      if (response.data.success) {
        if (response.data.user) {
          localStorage.setItem('eduflow-user', JSON.stringify(response.data.user));
          setUser(response.data.user);
        }
        toast.success("Accessibility settings saved");
      }
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
      toast.error("Failed to save accessibility settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAdminSettings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('eduflow-token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const adminSettings = {
        maintenanceMode,
        allowRegistration,
        apiAccess,
        emailVerification
      };

      const response = await api.put(`/admin/settings`, adminSettings);

      toast.success("Admin settings saved");
    } catch (error) {
      console.error('Error saving admin settings:', error);
      toast.error("Failed to save admin settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlatformCustomization = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('eduflow-token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const customization = {
        platformName
      };

      const response = await api.put(`/admin/platform-customization`, customization);

      toast.success("Platform customization saved");
    } catch (error) {
      console.error('Error saving platform customization:', error);
      toast.error("Failed to save platform customization");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <AIAssistant />
      
      {/* Settings Header */}
      <div className="bg-muted/30 py-12">
        <div className="container">
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Customize your experience and application preferences
          </p>
        </div>
      </div>
      
      <div className="container mt-8">
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
            {user?.role === 'admin' && (
              <TabsTrigger value="admin">Admin Settings</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Dark</span>
                    <ThemeToggle />
                    <span className="text-sm">Light</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Color Accent</Label>
                  <div className="flex gap-2">
                    {['#00ebc7', '#ff5470', '#5d4d7a', '#fec6a1', '#151226'].map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border focus:outline-none focus:ring-2 focus:ring-primary ${
                          selectedAccent === color ? 'border-2 border-primary' : 'border-border'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedAccent(color)}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Avatar Assistant</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Show AI assistant</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={showAIAssistant}
                        onChange={(e) => setShowAIAssistant(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-muted rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveAppearance}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    { id: 'course-updates', label: 'Course Updates', desc: 'Get notified when courses are updated or new content is available' },
                    { id: 'comments-replies', label: 'Comments & Replies', desc: 'Get notified when someone replies to your comments or mentions you' },
                    { id: 'assignment-due', label: 'Assignment Due Dates', desc: 'Get reminded about upcoming assignment deadlines' },
                    { id: 'system-announcements', label: 'System Announcements', desc: 'Important announcements about the platform' },
                    { id: 'marketing-emails', label: 'Marketing Emails', desc: 'Receive promotional content and special offers' },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <Label htmlFor={item.id} className="text-base font-medium">{item.label}</Label>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={notifications[item.id]}
                          onChange={(e) => setNotifications({
                            ...notifications,
                            [item.id]: e.target.checked
                          })}
                        />
                        <div className="w-11 h-6 bg-muted rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveNotifications}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="accessibility">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility</CardTitle>
                <CardDescription>Adjust settings for better accessibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Text Size</Label>
                  <Slider 
                    value={textSize} 
                    onValueChange={setTextSize} 
                    min={1} 
                    max={4} 
                    step={1} 
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Small</span>
                    <span>Normal</span>
                    <span>Large</span>
                    <span>Extra Large</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Animation Speed</Label>
                  <Slider 
                    value={animationSpeed} 
                    onValueChange={setAnimationSpeed} 
                    min={0} 
                    max={3} 
                    step={1} 
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Off</span>
                    <span>Slow</span>
                    <span>Normal</span>
                    <span>Fast</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Reduced Motion</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reduce UI motion and animations</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={reducedMotion}
                        onChange={(e) => setReducedMotion(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-muted rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>High Contrast Mode</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Increase contrast for better visibility</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={highContrast}
                        onChange={(e) => setHighContrast(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-muted rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveAccessibility}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {user?.role === 'admin' && (
            <TabsContent value="admin">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Settings</CardTitle>
                  <CardDescription>Configure platform-wide settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Platform Maintenance</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Enable maintenance mode</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={maintenanceMode}
                          onChange={(e) => setMaintenanceMode(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-muted rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>User Registration</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Allow new users to register</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={allowRegistration}
                          onChange={(e) => setAllowRegistration(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-muted rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>API Access</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Enable external API access</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={apiAccess}
                          onChange={(e) => setApiAccess(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-muted rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>User Verification</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Require email verification</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={emailVerification}
                          onChange={(e) => setEmailVerification(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-muted rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSaveAdminSettings}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Platform Customization</CardTitle>
                  <CardDescription>Change platform-wide branding and styling</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Platform Name</Label>
                    <input 
                      type="text" 
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                        <span className="text-lg font-bold">E</span>
                      </div>
                      <Button variant="outline">Upload New Logo</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Favicon</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center">
                        <span className="text-xs font-bold">E</span>
                      </div>
                      <Button variant="outline">Upload New Favicon</Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSavePlatformCustomization}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
