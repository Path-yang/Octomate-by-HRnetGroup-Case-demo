'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Lock, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { Employee, EmploymentStatus, FieldPermission } from '@/lib/types';
import { calculateRetirementYear, calculateRetirementDate } from '@/lib/validations';
import { DEPARTMENTS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface EmploymentTabProps {
  data: Employee;
  onChange: (field: string, value: unknown) => void;
  isEditing: boolean;
  permissions: {
    workEmail: FieldPermission;
    employeeId: FieldPermission;
    department: FieldPermission;
    jobTitle: FieldPermission;
    employmentDate: FieldPermission;
    retirementAge: FieldPermission;
    retirementYear: FieldPermission;
    retirementDate: FieldPermission;
    reEmploymentDate: FieldPermission;
    employmentStatus: FieldPermission;
  };
}

const employmentStatuses: EmploymentStatus[] = [
  'Active',
  'Resigned',
  'Retired',
  'Terminated',
  'On Leave',
  'Probation',
];

export function EmploymentTab({ data, onChange, isEditing, permissions }: EmploymentTabProps) {
  // Auto-calculate retirement year and date when DOB or retirement age changes
  useEffect(() => {
    if (data.dateOfBirth && data.retirementAge) {
      const year = calculateRetirementYear(data.dateOfBirth, data.retirementAge);
      const date = calculateRetirementDate(data.dateOfBirth, data.retirementAge);
      onChange('retirementYear', year);
      onChange('retirementDate', date);
    }
  }, [data.dateOfBirth, data.retirementAge, onChange]);

  const getDisplayValue = (value: string | number | undefined, permission: FieldPermission) => {
    if (!permission.read) return '••••••••';
    if (value === undefined || value === null || value === '') return '-';
    return String(value);
  };

  const getStatusBadgeVariant = (status: EmploymentStatus) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Probation':
        return 'secondary';
      case 'On Leave':
        return 'outline';
      case 'Resigned':
      case 'Terminated':
        return 'destructive';
      case 'Retired':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const FieldWrapper = ({
    children,
    label,
    required,
    permission,
    autoCalculated,
  }: {
    children: React.ReactNode;
    label: string;
    required?: boolean;
    permission: FieldPermission;
    autoCalculated?: boolean;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className={cn(!permission.read && 'text-gray-400')}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {!permission.write && permission.read && (
          <Lock className="h-3 w-3 text-gray-400" />
        )}
        {autoCalculated && (
          <Badge variant="outline" className="text-[9px] px-1.5 py-0">
            Auto
          </Badge>
        )}
      </div>
      {children}
    </div>
  );

  return (
    <Card className="animate-fade-in border-t-4 border-t-[#00A651]">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#00A651]/10 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-[#00A651]" />
          </div>
          <div>
            <CardTitle>Employment & Lifecycle</CardTitle>
            <CardDescription>
              Work details and employment lifecycle information
            </CardDescription>
            {data.updatedAt && (
              <p className="text-xs text-gray-400 mt-1">
                Last modified: {new Date(data.updatedAt).toLocaleDateString('en-SG', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Work Email */}
          <FieldWrapper label="Work Email (for Login)" required permission={permissions.workEmail}>
            {isEditing && permissions.workEmail.write ? (
              <Input
                type="email"
                value={data.workEmail}
                onChange={(e) => onChange('workEmail', e.target.value)}
                placeholder="name@company.sg"
              />
            ) : (
              <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                {getDisplayValue(data.workEmail, permissions.workEmail)}
              </div>
            )}
          </FieldWrapper>

          {/* Employee ID */}
          <FieldWrapper label="Employee ID" permission={permissions.employeeId} autoCalculated>
            <div className="h-10 flex items-center px-3 bg-gray-100 dark:bg-gray-800 rounded-md border">
              <span className="font-mono">{getDisplayValue(data.employeeId, permissions.employeeId)}</span>
            </div>
          </FieldWrapper>

          {/* Employment Status */}
          <FieldWrapper label="Employment Status" permission={permissions.employmentStatus}>
            {isEditing && permissions.employmentStatus.write ? (
              <Select value={data.employmentStatus} onValueChange={(v) => onChange('employmentStatus', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {employmentStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                {permissions.employmentStatus.read ? (
                  <Badge variant={getStatusBadgeVariant(data.employmentStatus)}>
                    {data.employmentStatus}
                  </Badge>
                ) : (
                  '••••••••'
                )}
              </div>
            )}
          </FieldWrapper>

          {/* Department */}
          <FieldWrapper label="Department" required permission={permissions.department}>
            {isEditing && permissions.department.write ? (
              <Select value={data.department} onValueChange={(v) => onChange('department', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                {getDisplayValue(data.department, permissions.department)}
              </div>
            )}
          </FieldWrapper>

          {/* Job Title */}
          <FieldWrapper label="Job Title" permission={permissions.jobTitle}>
            {isEditing && permissions.jobTitle.write ? (
              <Input
                value={data.jobTitle}
                onChange={(e) => onChange('jobTitle', e.target.value)}
                placeholder="e.g. Software Engineer"
              />
            ) : (
              <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                {getDisplayValue(data.jobTitle, permissions.jobTitle)}
              </div>
            )}
          </FieldWrapper>

          {/* Employment Date */}
          <FieldWrapper label="Employment Date" required permission={permissions.employmentDate}>
            {isEditing && permissions.employmentDate.write ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !data.employmentDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.employmentDate ? format(new Date(data.employmentDate), 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data.employmentDate ? new Date(data.employmentDate) : undefined}
                    onSelect={(date) => onChange('employmentDate', date?.toISOString().split('T')[0])}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                {data.employmentDate && permissions.employmentDate.read
                  ? format(new Date(data.employmentDate), 'PPP')
                  : '-'}
              </div>
            )}
          </FieldWrapper>

          {/* Retirement Age */}
          <FieldWrapper label="Retirement Age" permission={permissions.retirementAge}>
            {isEditing && permissions.retirementAge.write ? (
              <Input
                type="number"
                value={data.retirementAge}
                onChange={(e) => onChange('retirementAge', parseInt(e.target.value))}
                min={55}
                max={70}
              />
            ) : (
              <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                {getDisplayValue(data.retirementAge, permissions.retirementAge)} years
              </div>
            )}
          </FieldWrapper>

          {/* Retirement Year */}
          <FieldWrapper label="Retirement Year" permission={permissions.retirementYear} autoCalculated>
            <div className="h-10 flex items-center px-3 bg-gray-100 dark:bg-gray-800 rounded-md border">
              {getDisplayValue(data.retirementYear, permissions.retirementYear)}
            </div>
          </FieldWrapper>

          {/* Retirement Date */}
          <FieldWrapper label="Retirement Date" permission={permissions.retirementDate} autoCalculated>
            <div className="h-10 flex items-center px-3 bg-gray-100 dark:bg-gray-800 rounded-md border">
              {data.retirementDate && permissions.retirementDate.read
                ? format(new Date(data.retirementDate), 'PPP')
                : '-'}
            </div>
          </FieldWrapper>

          {/* Re-Employment Date */}
          <FieldWrapper label="Re-Employment Date" permission={permissions.reEmploymentDate}>
            {isEditing && permissions.reEmploymentDate.write ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !data.reEmploymentDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.reEmploymentDate
                      ? format(new Date(data.reEmploymentDate), 'PPP')
                      : 'Select date (if applicable)'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data.reEmploymentDate ? new Date(data.reEmploymentDate) : undefined}
                    onSelect={(date) => onChange('reEmploymentDate', date?.toISOString().split('T')[0])}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                {data.reEmploymentDate && permissions.reEmploymentDate.read
                  ? format(new Date(data.reEmploymentDate), 'PPP')
                  : '-'}
              </div>
            )}
          </FieldWrapper>
        </div>
      </CardContent>
    </Card>
  );
}

