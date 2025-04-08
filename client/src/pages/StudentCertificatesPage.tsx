import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import api from '@/lib/api';
import { toast } from 'sonner';
import { CertificateViewer } from '@/components/CertificateViewer';

interface Certificate {
  _id: string;
  courseName: string;
  certificateNumber: string;
  issueDate: string;
  courseId?: {
    _id: string;
    title?: string;
    thumbnail?: string;
  };
}

const StudentCertificatesPage = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/certificates');
        
        if (response.data.success) {
          setCertificates(response.data.certificates);
        }
      } catch (error) {
        console.error('Error fetching certificates:', error);
        toast.error('Failed to fetch certificates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setIsViewerOpen(true);
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Certificates</h1>
        <div className="text-sm text-muted-foreground">
          {certificates.length} certificates earned
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : certificates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Certificates Yet</h3>
            <p className="text-muted-foreground mb-4">
              Complete courses to earn certificates
            </p>
            <Button onClick={() => window.location.href = '/courses'}>
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate) => (
            <Card key={certificate._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  {certificate.courseId?.title || certificate.courseName}
                </CardTitle>
                <CardDescription>
                  Issued on {new Date(certificate.issueDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate ID:</span>
                    <span className="font-mono">{certificate.certificateNumber}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleViewCertificate(certificate)}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.open(`/verify-certificate?id=${certificate.certificateNumber}`, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CertificateViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        certificate={selectedCertificate}
        userName={user?.name || ''}
      />
    </div>
  );
};

export default StudentCertificatesPage; 