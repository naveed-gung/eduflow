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
    // If it's already an embed URL, return as is
    if (url.includes('embed')) return url;
    
    // Handle specific Google Drive URL format
    if (url.includes('drive.google.com/file/d/')) {
      // Extract file ID using regex
      const fileIdMatch = url.match(/\/d\/([^/]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
      }
    }
    
    // For URLs with a more complex format
    const googleDriveIdRegex = /[-\w]{25,}/;
    const match = url.match(googleDriveIdRegex);
    if (match) {
      return `https://drive.google.com/file/d/${match[0]}/preview`;
    }
    
    // If no Google Drive pattern is found, return the original URL
    return url;
  };

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
            src={getEmbedUrl(videoUrl)}
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