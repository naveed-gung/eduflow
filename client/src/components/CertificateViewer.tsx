import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Award, Download, Shield, X } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface CertificateViewerProps {
  isOpen: boolean;
  onClose: () => void;
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
  } | null;
  userName: string;
}

export function CertificateViewer({ isOpen, onClose, certificate, userName }: CertificateViewerProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  
  if (!certificate) return null;
  
  // Format the date
  const formattedDate = new Date(certificate.issueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Format current date for footer
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Course name (either from the populated course or from the certificate itself)
  const courseName = certificate.courseId?.title || certificate.courseName;
  
  // Generate PDF from the certificate content using html2canvas
  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    try {
      toast.info("Generating your certificate, please wait...");
      
      // Convert the HTML element to a canvas
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Calculate the PDF dimensions based on the canvas
      const imgWidth = 210; // A4 width in mm (portrait)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF instance
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      
      // Add the canvas as an image to the PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Save the PDF
      const fileName = `${userName.replace(/\s+/g, '_')}_${courseName.replace(/\s+/g, '_')}_Certificate.pdf`;
      pdf.save(fileName);
      
      toast.success("Certificate downloaded successfully!");
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to generate PDF. Trying alternate method...");
      
      // Fallback to print dialog if PDF generation fails
      window.print();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-center">Certificate of Completion</DialogTitle>
        </DialogHeader>
        
        <div 
          ref={certificateRef}
          className="p-6 border-2 border-primary/20 rounded-lg print:border-2 print:border-black bg-white"
        >
          <div className="text-center py-4 mb-8">
            <div className="flex justify-center mb-4">
              <Award className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">Certificate of Completion</h1>
            <p className="text-lg text-gray-700">This certifies that</p>
            <h2 className="text-2xl font-bold my-4 text-gray-900">{userName}</h2>
            <p className="text-lg text-gray-700">has successfully completed the course</p>
            <h3 className="text-xl font-bold mt-4 mb-2 text-gray-800">{courseName}</h3>
            <p className="text-lg text-gray-700">on {formattedDate}</p>
          </div>
          
          <div className="flex justify-between items-end pt-6 mt-8 border-t border-gray-300">
            <div>
              <p className="text-sm font-medium text-gray-800">Certificate ID:</p>
              <p className="text-xs font-mono text-gray-700">{certificate.certificateNumber}</p>
              <Link 
                to={`/verify-certificate?id=${certificate.certificateNumber}`}
                className="text-xs text-primary flex items-center mt-1 hover:underline"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
              >
                <Shield className="h-3 w-3 mr-1" />
                Verify Certificate
              </Link>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">Verified by</p>
              <p className="text-lg font-bold text-gray-900">EduFlow</p>
              <p className="text-xs text-gray-700">{currentDate}</p>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 