import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Award, CheckCircle, Search, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { useSearchParams } from 'react-router-dom';
import api from '@/lib/api';  // Import the API client

interface VerificationResult {
  success: boolean;
  message: string;
  certificate?: {
    certificateNumber: string;
    userName: string;
    userEmail: string;
    courseName: string;
    courseTitle: string;
    instructorName: string;
    issueDate: string;
  };
}

const CertificateVerifierPage = () => {
  const [searchParams] = useSearchParams();
  const [certificateNumber, setCertificateNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  
  // Check for certificate ID in URL parameters
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setCertificateNumber(idFromUrl);
      // Automatically verify if ID is provided in URL
      verifyCertificate(idFromUrl);
    }
  }, [searchParams]);
  
  // API call to verify certificate
  const verifyWithApi = async (id: string) => {
    try {
      setIsVerifying(true);
      setResult(null);
      
      // Call the verification API endpoint
      const response = await api.get(`/certificates/verify/${id}`);
      
      setResult(response.data);
      
      if (response.data.success) {
        toast.success('Certificate is valid!');
      } else {
        toast.error('Certificate verification failed');
      }
    } catch (error) {
      console.error('Certificate verification error:', error);
      
      // Set a generic error result
      const errorResult: VerificationResult = {
        success: false,
        message: 'Failed to verify certificate. Please try again or contact support.',
      };
      
      setResult(errorResult);
      toast.error('Certificate verification failed');
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Unified function to verify certificate
  const verifyCertificate = async (id: string) => {
    await verifyWithApi(id);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certificateNumber.trim()) {
      toast.error('Please enter a certificate number');
      return;
    }
    
    verifyCertificate(certificateNumber);
  };
  
  // Format a date string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="container py-10">
      <PageHeader 
        title="Certificate Verification"
        description="Verify the authenticity of an EduFlow certificate"
        icon={<Award className="w-10 h-10 text-primary" />}
      />
      
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Verify a Certificate</CardTitle>
            <CardDescription>
              Enter the certificate number to verify its authenticity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="Enter certificate number (e.g., CERT-123ABC)"
                  value={certificateNumber}
                  onChange={(e) => setCertificateNumber(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <Button type="submit" className="w-full" disabled={isVerifying}>
                {isVerifying ? 'Verifying...' : 'Verify Certificate'}
              </Button>
            </form>
            
            {result && (
              <div className="mt-6 p-4 rounded-lg border bg-card">
                {result.success ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                      <CheckCircle className="h-5 w-5" />
                      <h3 className="font-semibold">Certificate is Valid</h3>
                    </div>
                    
                    <div className="space-y-2 mt-3">
                      <div>
                        <h4 className="text-sm font-semibold">Certificate Number</h4>
                        <p className="text-sm font-mono">{result.certificate?.certificateNumber}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">Issued To</h4>
                        <p className="text-sm">{result.certificate?.userName}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">Course</h4>
                        <p className="text-sm">{result.certificate?.courseTitle}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">Instructor</h4>
                        <p className="text-sm">{result.certificate?.instructorName}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">Issue Date</h4>
                        <p className="text-sm">{formatDate(result.certificate?.issueDate || '')}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-500">
                    <XCircle className="h-5 w-5" />
                    <div>
                      <h3 className="font-semibold">Certificate is Invalid</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.message || 'The certificate could not be verified. Please check the certificate number and try again.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground border-t pt-6">
            <p>
              All EduFlow certificates contain a unique certificate number for verification purposes. 
              If you believe there is an error, please contact support.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CertificateVerifierPage; 