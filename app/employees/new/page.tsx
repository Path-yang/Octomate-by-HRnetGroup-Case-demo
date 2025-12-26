'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProfileForm } from '@/components/employees/ProfileForm';
import { Shield, AlertTriangle, ArrowLeft } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { Employee, AuditLogEntry } from '@/lib/types';
import { generateEmployeeId } from '@/lib/validations';
import { mockEmployees, mockAuditLogs } from '@/lib/mock-data';
import { toast } from 'sonner';
import Link from 'next/link';

export default function NewEmployeePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [pdpaConsent, setPdpaConsent] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { currentUser, currentRole, canAdd } = usePermissions();

  // Initialize data on mount
  useEffect(() => {
    try {
      const storedEmployees = localStorage.getItem('octomate_employees');
      const storedLogs = localStorage.getItem('octomate_audit_logs');
      
      if (storedEmployees) {
        setEmployees(JSON.parse(storedEmployees));
      } else {
        setEmployees(mockEmployees);
        localStorage.setItem('octomate_employees', JSON.stringify(mockEmployees));
      }
      
      if (storedLogs) {
        setAuditLogs(JSON.parse(storedLogs));
      } else {
        setAuditLogs(mockAuditLogs);
        localStorage.setItem('octomate_audit_logs', JSON.stringify(mockAuditLogs));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setEmployees(mockEmployees);
      setAuditLogs(mockAuditLogs);
    }
    setMounted(true);
  }, []);

  // Check permission
  if (!canAdd()) {
    return (
      <div className="p-6">
        <PageHeader
          title="Access Denied"
          breadcrumbs={[
            { label: 'Employees', href: '/employees' },
            { label: 'Add New' },
          ]}
        />
        <Alert variant="destructive" className="mt-6">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to add new employees. Only HR Administrators can create new employee profiles.
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

  if (!mounted) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="max-w-2xl h-96 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  const newEmployee: Employee = {
    id: `emp-${Date.now()}`,
    fullName: '',
    alias: '',
    nricFin: '',
    identityNo: '',
    cardType: 'NRIC',
    nationality: 'Singaporean',
    dateOfBirth: '',
    gender: 'Male',
    race: 'Chinese',
    religion: 'No Religion',
    maritalStatus: 'Single',
    photoUrl: '',
    workEmail: '',
    employeeId: generateEmployeeId(),
    department: '',
    jobTitle: '',
    employmentDate: new Date().toISOString().split('T')[0],
    retirementAge: 63,
    employmentStatus: 'Probation',
    educationHistory: [],
    workExperience: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pdpaConsent: false,
  };

  const handleSave = (employee: Employee) => {
    try {
      const savedEmployee = {
        ...employee,
        pdpaConsent: pdpaConsent,
        pdpaConsentDate: pdpaConsent ? new Date().toISOString() : undefined,
      };

      const newEmployees = [...employees, savedEmployee];
      setEmployees(newEmployees);
      localStorage.setItem('octomate_employees', JSON.stringify(newEmployees));

      const createLog: AuditLogEntry = {
        id: `audit-${Date.now()}`,
        employeeId: savedEmployee.id,
        employeeName: savedEmployee.fullName,
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentRole,
        action: 'create',
        description: 'Created new employee profile',
      };
      const newLogs = [createLog, ...auditLogs];
      setAuditLogs(newLogs);
      localStorage.setItem('octomate_audit_logs', JSON.stringify(newLogs));

      toast.success(`Employee ${savedEmployee.fullName} created successfully`);
      router.push(`/employees/${savedEmployee.id}`);
    } catch (error) {
      toast.error('Failed to create employee');
    }
  };

  if (!showForm) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader
          title="Add New Employee"
          description="Create a new employee profile in the system"
          breadcrumbs={[
            { label: 'Employees', href: '/employees' },
            { label: 'Add New' },
          ]}
        />

        <Card className="max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-[#00A651]/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-[#00A651]" />
              </div>
              <div>
                <CardTitle>PDPA Consent Required</CardTitle>
                <CardDescription>
                  Before creating a new employee profile, please confirm PDPA consent
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Personal Data Protection Act (PDPA) Notice</strong>
                <br />
                <br />
                Under Singapore&apos;s PDPA, organizations must obtain consent before collecting,
                using, or disclosing personal data. By proceeding, you confirm that:
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>The employee has been informed about the purpose of data collection</li>
                  <li>The employee has given consent for their data to be processed</li>
                  <li>The data will be used only for employment-related purposes</li>
                  <li>The organization will protect the data in accordance with PDPA requirements</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex items-start space-x-3 p-4 border rounded-lg bg-gray-50">
              <Checkbox
                id="pdpa-consent"
                checked={pdpaConsent}
                onCheckedChange={(checked) => setPdpaConsent(checked as boolean)}
              />
              <Label htmlFor="pdpa-consent" className="text-sm leading-relaxed cursor-pointer">
                I confirm that the employee has provided consent for their personal data to be
                collected and processed in accordance with Octomate&apos;s privacy policy and
                Singapore&apos;s Personal Data Protection Act (PDPA).
              </Label>
            </div>

            <div className="flex gap-3">
              <Link href="/employees">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </Link>
              <Button
                onClick={() => setShowForm(true)}
                disabled={!pdpaConsent}
                className="bg-[#00A651] hover:bg-[#008541]"
              >
                Proceed to Create Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Add New Employee"
        description="Fill in the employee details below"
        breadcrumbs={[
          { label: 'Employees', href: '/employees' },
          { label: 'Add New' },
        ]}
      />

      <ProfileForm employee={newEmployee} onSave={handleSave} isNew />
    </div>
  );
}
