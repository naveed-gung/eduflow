import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  AlertCircle, 
  Check, 
  Image as ImageIcon, 
  Loader2, 
  UploadCloud, 
  X,
  Image,
  ImagePlus,
  Trash2,
  HelpCircle,
  PlusCircle,
  MinusCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fileToBase64, validateImageFile } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthProvider';
import api from '@/lib/api';

interface CourseFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isEdit?: boolean;
  courseData?: any;
}

export function CourseForm({ onSuccess, onCancel, isEdit, courseData }: CourseFormProps) {
  // Course data states
  const [title, setTitle] = useState(courseData?.title || '');
  const [description, setDescription] = useState(courseData?.description || '');
  const [shortDescription, setShortDescription] = useState(courseData?.shortDescription || '');
  const [category, setCategory] = useState(courseData?.category || '');
  const [price, setPrice] = useState(courseData?.price?.toString() || '');
  const [duration, setDuration] = useState(courseData?.duration || '');
  const [level, setLevel] = useState(courseData?.level || 'beginner');
  const [isPublic, setIsPublic] = useState(courseData?.published || true);
  const [published, setPublished] = useState(courseData?.published || true);
  const [featured, setFeatured] = useState(courseData?.featured || false);
  const [language, setLanguage] = useState(courseData?.language || 'English');
  const [modulesData, setModulesData] = useState(courseData?.modules || []);
  const [learningPoints, setLearningPoints] = useState(courseData?.learningPoints || []);
  
  // Image upload states
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(courseData?.thumbnail || null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Hidden file input reference
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle thumbnail upload click
  const handleThumbnailClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle file change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setIsUploading(true);
      // Convert to base64
      const base64Image = await fileToBase64(file);
      setThumbnailPreview(base64Image);
      toast.success('Thumbnail uploaded successfully');
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      setUploadError('Failed to upload thumbnail');
    } finally {
      setIsUploading(false);
      // Clear the input value to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Remove thumbnail
  const handleRemoveThumbnail = () => {
    setThumbnailPreview(null);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!title || !description || !category || !level || !price) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      // Create course data object
      const courseData = {
        title,
        description,
        shortDescription,
        category,
        level,
        price: parseFloat(price),
        thumbnail: thumbnailPreview || 'https://placehold.co/600x400?text=Course+Thumbnail',
        language,
        modules: modulesData,
        learningPoints: learningPoints.filter(point => point.trim() !== ''),
        published: published,
        featured: featured
      };
      
      // If editing, update the course, otherwise create a new one
      if (isEdit && courseData._id) {
        const response = await api.put(`/courses/${courseData._id}`, courseData);
        toast.success('Course updated successfully!');
      } else {
        const response = await api.post(`/courses`, courseData);
        toast.success('Course created successfully!');
      }
      
      // Call the success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Failed to save course');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Course</CardTitle>
        <CardDescription>
          Add a new course to your platform. All fields marked with * are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="media">Media & Content</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input 
                  id="title" 
                  placeholder="e.g., Advanced JavaScript Programming" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Provide a detailed description of your course"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea 
                  id="shortDescription" 
                  className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Provide a short description of your course"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="programming">Programming</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="personal-development">Personal Development</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="health">Health & Fitness</SelectItem>
                      <SelectItem value="language">Language</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="e.g., 49.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input 
                    id="duration" 
                    placeholder="e.g., 6 weeks" 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="level">Difficulty Level</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select 
                  value={isPublic ? "public" : "private"} 
                  onValueChange={(value) => setIsPublic(value === "public")}
                >
                  <SelectTrigger id="visibility">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private (Draft)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="media" className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label>Course Thumbnail *</Label>
                {thumbnailPreview ? (
                  <div className="relative overflow-hidden rounded-md border border-input">
                    <img 
                      src={thumbnailPreview} 
                      alt="Course thumbnail" 
                      className="w-full max-h-[300px] object-cover"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 rounded-full bg-background/80 hover:bg-background/90"
                      onClick={handleRemoveThumbnail}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="h-[200px] flex flex-col items-center justify-center gap-4 rounded-md border border-dashed border-muted-foreground/50 p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={handleThumbnailClick}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                        <p className="text-sm text-muted-foreground">Uploading thumbnail...</p>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        <div className="text-center">
                          <p className="text-sm font-medium">Click to upload thumbnail</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            JPG, PNG or GIF. Max 5MB.
                          </p>
                        </div>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                )}
                
                {uploadError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Content Sections</Label>
                <div className="p-4 rounded-md bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">
                    You can add course sections and content after creating the course.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-3 mt-8">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Create Course
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 