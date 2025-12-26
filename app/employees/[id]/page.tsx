'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProfileForm } from '@/components/employees/ProfileForm';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  Shield,
  Download,
  Trash2,
  FileDown,
  AlertTriangle,
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { mockEmployees, mockAuditLogs } from '@/lib/mock-data';
import { Employee, AuditLogEntry, EmploymentStatus } from '@/lib/types';
import { toast } from 'sonner';

// Simple date formatting
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-SG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return 'Unknown date';
  }
}

function formatDateLong(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-SG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch {
    return 'Unknown date';
  }
}

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = params.id as string;
  const editMode = searchParams.get('edit') === 'true';

  const [mounted, setMounted] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [showPdpaDialog, setShowPdpaDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pdpaExportConsent, setPdpaExportConsent] = useState(false);

  const { currentUser, currentRole, canView, canEdit, canDelete, canExport, isSelfProfile } = usePermissions();

  // Initialize and find employee
  useEffect(() => {
    try {
      const storedEmployees = localStorage.getItem('octomate_employees');
      const storedLogs = localStorage.getItem('octomate_audit_logs');
      
      let empList: Employee[];
      if (storedEmployees) {
        empList = JSON.parse(storedEmployees);
      } else {
        empList = mockEmployees;
        localStorage.setItem('octomate_employees', JSON.stringify(mockEmployees));
      }
      setEmployees(empList);
      
      let logList: AuditLogEntry[];
      if (storedLogs) {
        logList = JSON.parse(storedLogs);
      } else {
        logList = mockAuditLogs;
        localStorage.setItem('octomate_audit_logs', JSON.stringify(mockAuditLogs));
      }
      setAuditLogs(logList);
      
      const found = empList.find((e) => e.id === employeeId);
      setEmployee(found || null);
    } catch (error) {
      console.error('Error loading data:', error);
      setEmployees(mockEmployees);
      setAuditLogs(mockAuditLogs);
      const found = mockEmployees.find((e) => e.id === employeeId);
      setEmployee(found || null);
    }
    
    setMounted(true);
  }, [employeeId]);

  const handleSave = (updatedEmployee: Employee) => {
    const newEmployees = employees.map((e) => (e.id === updatedEmployee.id ? updatedEmployee : e));
    setEmployees(newEmployees);
    setEmployee(updatedEmployee);
    localStorage.setItem('octomate_employees', JSON.stringify(newEmployees));
  };

  const handleAuditLog = (field: string, oldValue: string, newValue: string) => {
    if (!employee) return;
    
    const newLog: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.fullName,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentRole,
      action: 'update',
      field,
      oldValue,
      newValue,
      description: `Updated ${field}`,
    };
    const newLogs = [newLog, ...auditLogs];
    setAuditLogs(newLogs);
    localStorage.setItem('octomate_audit_logs', JSON.stringify(newLogs));
  };

  const handleExportData = () => {
    if (!pdpaExportConsent) {
      setShowPdpaDialog(true);
      return;
    }

    try {
      const dataToExport = {
        ...employee,
        exportedAt: new Date().toISOString(),
        exportedBy: currentUser.name,
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employee-${employee?.employeeId}-data-export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully (PDPA compliant)');
      setShowPdpaDialog(false);
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleDelete = () => {
    if (!canDelete()) {
      toast.error('You do not have permission to delete employees');
      return;
    }

    const newEmployees = employees.filter((e) => e.id !== employeeId);
    setEmployees(newEmployees);
    localStorage.setItem('octomate_employees', JSON.stringify(newEmployees));
    
    if (employee) {
      const deleteLog: AuditLogEntry = {
        id: `audit-${Date.now()}`,
        employeeId: employee.id,
        employeeName: employee.fullName,
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentRole,
        action: 'delete',
        description: `Deleted employee profile`,
      };
      const newLogs = [deleteLog, ...auditLogs];
      localStorage.setItem('octomate_audit_logs', JSON.stringify(newLogs));
    }

    toast.success('Employee profile deleted');
    router.push('/employees');
  };

  const getStatusColor = (status: EmploymentStatus) => {
    switch (status) {
      case 'Active': return 'bg-green-500';
      case 'Probation': return 'bg-blue-500';
      case 'On Leave': return 'bg-yellow-500';
      case 'Resigned':
      case 'Terminated': return 'bg-red-500';
      case 'Retired': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  if (!mounted) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="flex gap-6">
          <div className="h-32 w-32 bg-gray-200 rounded-xl animate-pulse" />
          <div className="space-y-3 flex-1">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <PageHeader
          title="Employee Not Found"
          breadcrumbs={[
            { label: 'Employees', href: '/employees' },
            { label: 'Not Found' },
          ]}
        />
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="h-16 w-16 text-amber-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Employee Not Found</h3>
            <p className="text-gray-500 text-center max-w-md mb-4">
              The employee profile you are looking for does not exist or has been deleted.
            </p>
            <Link href="/employees">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Employees
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check access
  if (!canView(employeeId)) {
    return (
      <div className="p-6">
        <PageHeader
          title="Access Denied"
          breadcrumbs={[
            { label: 'Employees', href: '/employees' },
            { label: 'Access Denied' },
          ]}
        />
        <Alert variant="destructive" className="mt-6">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to view this employee profile.
            {currentRole === 'employee' && ' As an employee, you can only view your own profile.'}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/employees">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Employees
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={employee.fullName}
        breadcrumbs={[
          { label: 'Employees', href: '/employees' },
          { label: employee.fullName },
        ]}
        actions={
          <div className="flex gap-2">
            {(canExport() || isSelfProfile(employeeId)) && (
              <Button variant="outline" onClick={() => setShowPdpaDialog(true)}>
                <FileDown className="h-4 w-4 mr-2" />
                Request Data Export
              </Button>
            )}
            {canDelete() && (
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        }
      />

      {/* Employee Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 md:h-32 md:w-32">
                <AvatarImage src={employee.photoUrl} />
                <AvatarFallback className="bg-[#00A651]/10 text-[#00A651] text-2xl md:text-3xl">
                  {employee.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white ${getStatusColor(employee.employmentStatus)}`}
              />
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-bold">{employee.fullName}</h2>
                    <Badge
                      variant={employee.employmentStatus === 'Active' ? 'default' : 'secondary'}
                      className={employee.employmentStatus === 'Active' ? 'bg-[#00A651]' : ''}
                    >
                      {employee.employmentStatus}
                    </Badge>
                    {isSelfProfile(employeeId) && (
                      <Badge variant="outline">Your Profile</Badge>
                    )}
                  </div>
                  <p className="text-gray-500 text-lg mt-1">{employee.jobTitle}</p>
                  <p className="text-sm text-gray-400 font-mono mt-1">{employee.employeeId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span>{employee.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{employee.workEmail}</span>
                </div>
                {employee.contactNo && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{employee.contactNo}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Joined {formatDate(employee.employmentDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PDPA Consent Notice */}
      {employee.pdpaConsent && (
        <Alert className="border-green-200 bg-green-50">
          <Shield className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            PDPA consent obtained on {formatDateLong(employee.pdpaConsentDate || employee.createdAt)}.
            Data is being processed in accordance with Singapore&apos;s Personal Data Protection Act.
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Form */}
      <ProfileForm
        employee={employee}
        onSave={handleSave}
        onAuditLog={handleAuditLog}
      />

      {/* PDPA Export Dialog */}
      <Dialog open={showPdpaDialog} onOpenChange={setShowPdpaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#00A651]" />
              PDPA Data Export Request
            </DialogTitle>
            <DialogDescription>
              Under Singapore&apos;s Personal Data Protection Act (PDPA), you have the right to request
              a copy of your personal data. This export will include all data associated with this profile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="pdpa-consent"
                checked={pdpaExportConsent}
                onCheckedChange={(checked) => setPdpaExportConsent(checked as boolean)}
              />
              <Label htmlFor="pdpa-consent" className="text-sm leading-relaxed">
                I understand that this data export is for personal use only and I agree not to share
                sensitive information with unauthorized parties.
              </Label>
            </div>

            <Alert>
              <AlertDescription className="text-sm">
                <strong>Data Retention Notice:</strong> Personal data is retained for the duration of
                employment plus 7 years, as required by Singapore employment regulations.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPdpaDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExportData}
              disabled={!pdpaExportConsent}
              className="bg-[#00A651] hover:bg-[#008541]"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Employee Profile
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{employee.fullName}&apos;s</strong> profile?
              This action cannot be undone. All associated data will be permanently removed.
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This will delete all personal data, employment records, and audit history
              for this employee.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
