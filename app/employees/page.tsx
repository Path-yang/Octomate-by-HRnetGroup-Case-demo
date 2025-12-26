'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmployeeList } from '@/components/employees/EmployeeList';
import { UserPlus, Upload } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { mockEmployees } from '@/lib/mock-data';
import { Employee } from '@/lib/types';
import { toast } from 'sonner';

export default function EmployeesPage() {
  const [mounted, setMounted] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const { canAdd, canImport } = usePermissions();

  // Initialize data on mount
  useEffect(() => {
    try {
      const storedEmployees = localStorage.getItem('octomate_employees');
      if (storedEmployees) {
        setEmployees(JSON.parse(storedEmployees));
      } else {
        setEmployees(mockEmployees);
        localStorage.setItem('octomate_employees', JSON.stringify(mockEmployees));
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      setEmployees(mockEmployees);
    }
    setMounted(true);
  }, []);

  const handleExport = (ids: string[]) => {
    try {
      const dataToExport = employees.filter((emp) => ids.includes(emp.id));
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employees-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${dataToExport.length} employees`);
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Employee Directory"
        description="Manage and view all employee profiles in the organization"
        breadcrumbs={[{ label: 'Employees' }]}
        actions={
          <div className="flex gap-2">
            {canImport() && (
              <Button variant="outline" onClick={() => toast.info('Bulk import feature coming soon')}>
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import
              </Button>
            )}
            {canAdd() && (
              <Link href="/employees/new">
                <Button className="bg-[#00A651] hover:bg-[#008541]">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </Link>
            )}
          </div>
        }
      />

      <EmployeeList employees={employees} isLoading={!mounted} onExport={handleExport} />
    </div>
  );
}
