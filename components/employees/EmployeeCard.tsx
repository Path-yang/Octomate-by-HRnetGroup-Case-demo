'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Building2, Calendar, ChevronRight } from 'lucide-react';
import { Employee, EmploymentStatus } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EmployeeCardProps {
  employee: Employee;
  variant?: 'default' | 'compact';
  className?: string;
}

export function EmployeeCard({ employee, variant = 'default', className }: EmployeeCardProps) {
  const getStatusColor = (status: EmploymentStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500';
      case 'Probation':
        return 'bg-blue-500';
      case 'On Leave':
        return 'bg-yellow-500';
      case 'Resigned':
      case 'Terminated':
        return 'bg-red-500';
      case 'Retired':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  if (variant === 'compact') {
    return (
      <Link href={`/employees/${employee.id}`}>
        <Card className={cn('hover:shadow-md transition-shadow cursor-pointer', className)}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={employee.photoUrl} />
                  <AvatarFallback className="bg-[#00A651]/10 text-[#00A651] text-sm">
                    {employee.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white',
                    getStatusColor(employee.employmentStatus)
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{employee.fullName}</p>
                <p className="text-sm text-gray-500 truncate">{employee.jobTitle}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/employees/${employee.id}`}>
      <Card className={cn('hover:shadow-lg transition-all duration-300 cursor-pointer group', className)}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={employee.photoUrl} />
                <AvatarFallback className="bg-[#00A651]/10 text-[#00A651] text-lg">
                  {employee.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white',
                  getStatusColor(employee.employmentStatus)
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-[#00A651] transition-colors">
                    {employee.fullName}
                  </h3>
                  <p className="text-gray-500">{employee.jobTitle}</p>
                </div>
                <Badge
                  variant={
                    employee.employmentStatus === 'Active'
                      ? 'default'
                      : employee.employmentStatus === 'Probation'
                      ? 'secondary'
                      : 'outline'
                  }
                  className={employee.employmentStatus === 'Active' ? 'bg-[#00A651]' : ''}
                >
                  {employee.employmentStatus}
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{employee.department}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{employee.workEmail}</span>
                </div>
                {employee.contactNo && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{employee.contactNo}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Joined {format(new Date(employee.employmentDate), 'MMM yyyy')}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

