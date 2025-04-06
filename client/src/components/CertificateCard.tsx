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
    <Card className="overflow-hidden border-primary/10 hover:border-primary/30 transition-colors">
      <div className="bg-primary/5 p-4 flex items-center justify-center border-b">
        <Award className="h-12 w-12 text-primary" />
      </div>
      <CardContent className="p-6">
        <div className="text-center">
          <h3 className="font-semibold mb-1 text-primary">Certificate of Completion</h3>
          <h4 className="text-lg font-bold mb-4">{courseName}</h4>
          
          <div className="text-sm text-muted-foreground mb-4">
            <p>Issued on: {formattedDate}</p>
            <p className="text-xs mt-1 font-mono">CERT ID: {certificate.certificateNumber}</p>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full" 
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