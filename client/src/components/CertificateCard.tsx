import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download } from 'lucide-react';

interface CertificateCardProps {
  certificate: {
    _id: string;
    courseName: string;
    certificateNumber: string;
    issueDate: string;
    courseId?: {
      _id: string;
      title?: string;
      thumbnail?: string;
    };
  };
  onView?: (certificateId: string) => void;
}

export function CertificateCard({ certificate, onView }: CertificateCardProps) {
  // Format the date
  const formattedDate = new Date(certificate.issueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Course name (either from the populated course or from the certificate itself)
  const courseName = certificate.courseId?.title || certificate.courseName;
  
  // Handle view certificate
  const handleViewCertificate = () => {
    if (onView) {
      onView(certificate._id);
    }
  };
  
  return (
    <Card className="overflow-hidden border-primary/10 hover:border-primary/30 transition-colors h-full flex flex-col">
      <div className="bg-primary/5 p-3 sm:p-4 flex items-center justify-center border-b">
        <Award className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
      </div>
      <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
        <div className="text-center flex-1 flex flex-col">
          <h3 className="font-semibold mb-1 text-primary text-sm sm:text-base">Certificate of Completion</h3>
          <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 line-clamp-2">{courseName}</h4>
          
          <div className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 mt-auto">
            <p>Issued on: {formattedDate}</p>
            <p className="text-xs mt-1 font-mono break-all">{certificate.certificateNumber}</p>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full text-xs sm:text-sm" 
            onClick={handleViewCertificate}
          >
            <Award className="mr-2 h-4 w-4" />
            View Certificate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 