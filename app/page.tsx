'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmployeeCard } from '@/components/employees/EmployeeCard';
import {
  Users,
  UserPlus,
  Upload,
  Download,
  Activity,
  TrendingUp,
  Clock,
  Building2,
  ArrowRight,
  FileText,
  AlertCircle,
  CheckCircle,
  Edit,
  Eye,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { usePermissions } from '@/hooks/usePermissions';
import { mockEmployees, mockAuditLogs } from '@/lib/mock-data';
import { Employee, AuditLogEntry, DashboardStats } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [employees, setEmployees] = useLocalStorage<Employee[]>('octomate_employees', []);
  const [auditLogs, setAuditLogs] = useLocalStorage<AuditLogEntry[]>('octomate_audit_logs', []);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const { currentRole, canAdd, canViewAudit, canExport, canImport } = usePermissions();

  // Initialize with mock data if empty
  useEffect(() => {
    const timer = setTimeout(() => {
      if (employees.length === 0) {
        setEmployees(mockEmployees);
      }
      if (auditLogs.length === 0) {
        setAuditLogs(mockAuditLogs);
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [employees.length, auditLogs.length, setEmployees, setAuditLogs]);

  // Calculate stats
  useEffect(() => {
    if (employees.length > 0) {
      const departmentBreakdown: Record<string, number> = {};
      const statusBreakdown: Record<string, number> = {};

      employees.forEach((emp) => {
        departmentBreakdown[emp.department] = (departmentBreakdown[emp.department] || 0) + 1;
        statusBreakdown[emp.employmentStatus] = (statusBreakdown[emp.employmentStatus] || 0) + 1;
      });

      setStats({
        totalEmployees: employees.length,
        activeEmployees: employees.filter((e) => e.employmentStatus === 'Active').length,
        pendingUpdates: employees.filter((e) => e.employmentStatus === 'Probation').length,
        recentChanges: auditLogs.filter((log) => {
          const logDate = new Date(log.timestamp);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return logDate > weekAgo;
        }).length,
        departmentBreakdown,
        statusBreakdown: statusBreakdown as Record<any, number>,
      });
    }
  }, [employees, auditLogs]);

  const recentEmployees = employees.slice(0, 4);
  const recentActivity = auditLogs.slice(0, 5);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'update':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'view':
        return <Eye className="h-4 w-4 text-gray-500" />;
      case 'export':
        return <Download className="h-4 w-4 text-purple-500" />;
      case 'delete':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Welcome to Octomate HR Employee Management System"
        actions={
          <div className="flex gap-2">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Employees</p>
                <p className="text-3xl font-bold mt-1">{stats?.totalEmployees || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-[#00A651]/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-[#00A651]" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>+2 this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Employees</p>
                <p className="text-3xl font-bold mt-1">{stats?.activeEmployees || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm text-gray-500">
              <span>
                {stats ? Math.round((stats.activeEmployees / stats.totalEmployees) * 100) : 0}% of
                total
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">On Probation</p>
                <p className="text-3xl font-bold mt-1">{stats?.pendingUpdates || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span>Pending confirmation</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Recent Changes</p>
                <p className="text-3xl font-bold mt-1">{stats?.recentChanges || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm text-gray-500">
              <span>Last 7 days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {canAdd() && (
          <Link href="/employees/new">
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 hover:border-[#00A651] hover:text-[#00A651]">
              <UserPlus className="h-5 w-5" />
              <span className="text-sm">Add Employee</span>
            </Button>
          </Link>
        )}
        {canImport() && (
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 hover:border-[#00A651] hover:text-[#00A651]">
            <Upload className="h-5 w-5" />
            <span className="text-sm">Bulk Import</span>
          </Button>
        )}
        {canExport() && (
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 hover:border-[#00A651] hover:text-[#00A651]">
            <Download className="h-5 w-5" />
            <span className="text-sm">Export Data</span>
          </Button>
        )}
        {canViewAudit() && (
          <Link href="/audit">
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 hover:border-[#00A651] hover:text-[#00A651]">
              <FileText className="h-5 w-5" />
              <span className="text-sm">Audit Logs</span>
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Employees */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Employees</CardTitle>
              <CardDescription>Latest employee profiles in the system</CardDescription>
            </div>
            <Link href="/employees">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentEmployees.map((employee, index) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                variant="compact"
                className={cn('animate-slide-in', `stagger-${index + 1}`)}
              />
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system changes</CardDescription>
            </div>
            {canViewAudit() && (
              <Link href="/audit">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((log, index) => (
                <div
                  key={log.id}
                  className={cn('flex gap-3 animate-slide-in', `stagger-${index + 1}`)}
                >
                  <div className="flex-shrink-0 mt-1">{getActionIcon(log.action)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{log.userName}</span>{' '}
                      <span className="text-gray-500">{log.description}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
          </p>
        </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Department Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(stats.departmentBreakdown).map(([dept, count]) => (
                <div
                  key={dept}
                  className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <p className="text-2xl font-bold text-[#00A651]">{count}</p>
                  <p className="text-sm text-gray-500 mt-1 truncate">{dept}</p>
                </div>
              ))}
        </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
