import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Award, MoreHorizontal, Search, Eye } from 'lucide-react';
import { CertificateViewer } from '@/components/CertificateViewer';
import { PageHeader } from '@/components/PageHeader';
import api from '@/lib/api';  // Import the API client
import { useNavigate } from 'react-router-dom';

interface CertificateType {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  courseId: {
    _id: string;
    title: string;
  };
  courseName: string;
  certificateNumber: string;
  issueDate: string;
}

const AdminCertificatesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<CertificateType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [isCertificateDialogOpen, setIsCertificateDialogOpen] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  // Fetch certificates
  useEffect(() => {
    const fetchCertificates = async () => {
      if (!user || user.role !== 'admin') return;
      
      try {
        setIsLoading(true);
        
        // Use the /admin/all endpoint as the primary endpoint since /admin is returning 404
        const response = await api.get(`/certificates/admin/all?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`);
        
        if (response.data.success) {
          setCertificates(response.data.certificates || []);
          setTotalItems(response.data.totalCount || 0);
          setTotalPages(response.data.totalPages || 1);
          console.log('Successfully fetched certificates from admin/all endpoint');
        }
      } catch (error) {
        console.error('Error fetching certificates:', error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          toast.error("Authentication error. Please log in again.");
          localStorage.removeItem('eduflow-token');
          navigate('/signin');
        } else {
          toast.error('Failed to fetch certificates. Please try again later.');
          
          // Set empty certificates array
          setCertificates([]);
          setTotalItems(0);
          setTotalPages(1);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user && user.role === 'admin') {
      fetchCertificates();
    }
  }, [user, currentPage, searchQuery, navigate, itemsPerPage]);
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    // Search is triggered by the useEffect dependency on searchQuery
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // View certificate
  const handleViewCertificate = (certificate: any, userName: string) => {
    setSelectedCertificate(certificate);
    setSelectedUserName(userName);
    setIsCertificateDialogOpen(true);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // If not admin, return null
  if (user?.role !== 'admin') {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }
  
  return (
    <div className="container py-10">
      <PageHeader 
        title="Certificate Management"
        description="View and manage all certificates issued on the platform"
        icon={<Award className="w-10 h-10 text-primary" />}
      />
      
      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search"
                placeholder="Search certificates..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Certificates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Certificates</CardTitle>
          <CardDescription>
            Manage all certificates issued on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-10">Loading certificates...</div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-10">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No certificates found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map((certificate) => (
                      <TableRow key={certificate._id}>
                        <TableCell className="font-medium">
                          {certificate.certificateNumber}
                        </TableCell>
                        <TableCell>
                          {certificate.userId?.name || 'Unknown User'}
                          <div className="text-xs text-muted-foreground">
                            {certificate.userId?.email}
                          </div>
                        </TableCell>
                        <TableCell>{certificate.courseName}</TableCell>
                        <TableCell>{formatDate(certificate.issueDate)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => 
                                handleViewCertificate(certificate, certificate.userId?.name || 'User')
                              }>
                                <Eye className="h-4 w-4 mr-2" />
                                View Certificate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Certificate Viewer Dialog */}
      <CertificateViewer 
        isOpen={isCertificateDialogOpen}
        onClose={() => setIsCertificateDialogOpen(false)}
        certificate={selectedCertificate}
        userName={selectedUserName}
      />
    </div>
  );
};

export default AdminCertificatesPage; 