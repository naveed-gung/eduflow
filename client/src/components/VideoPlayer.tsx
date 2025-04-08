import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}

export function VideoPlayer({ isOpen, onClose, videoUrl, title }: VideoPlayerProps) {
  // Convert Google Drive URL to embed URL
  const getEmbedUrl = (url: string) => {
    console.log('Original video URL:', url);
    
    // If it's already an embed URL, return as is
    if (url.includes('embed')) {
      console.log('Already an embed URL, returning as is');
      return url;
    }
    
    // Handle Google Drive URL format - this is the most common format
    if (url.includes('drive.google.com/file/d/')) {
      // Extract file ID using regex
      const fileIdMatch = url.match(/\/d\/([^/]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1].split('/')[0].split('?')[0]; // Clean up the ID
        const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        console.log('Converted Google Drive URL to:', embedUrl);
        return embedUrl;
      }
    }
    
    // For URLs with a more complex format
    const googleDriveIdRegex = /[-\w]{25,}/;
    const match = url.match(googleDriveIdRegex);
    if (match) {
      const embedUrl = `https://drive.google.com/file/d/${match[0]}/preview`;
      console.log('Converted Google Drive URL (complex format) to:', embedUrl);
      return embedUrl;
    }
    
    // For youtube videos, don't change anything
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      console.log('YouTube URL detected, returning as is');
      return url;
    }
    
    // If no pattern is found, return the original URL
    console.log('No matching pattern found, returning original URL');
    return url;
  };
  
  // Get the embed URL
  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[80vh] p-0">
        <div className="relative w-full h-full">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 rounded-full bg-background/80 hover:bg-background/90"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 