'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageHeader } from '@/components/layout/PageHeader';
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
  ChevronRight,
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { mockEmployees, mockAuditLogs } from '@/lib/mock-data';
import { Employee, AuditLogEntry, DashboardStats, EmploymentStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Simple date formatting to avoid date-fns issues
function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  } catch {
    return 'recently';
  }
}

function getStatusColor(status: EmploymentStatus) {
  switch (status) {
    case 'Active': return 'bg-green-500';
    case 'Probation': return 'bg-blue-500';
    case 'On Leave': return 'bg-yellow-500';
    case 'Resigned':
    case 'Terminated': return 'bg-red-500';
    case 'Retired': return 'bg-gray-500';
    default: return 'bg-gray-400';
  }
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const { canAdd, canViewAudit, canExport, canImport } = usePermissions();

  // Initialize data on mount
  useEffect(() => {
    // Load from localStorage or use mock data
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

  // Calculate stats when employees change
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
        recentChanges: auditLogs.length > 0 ? Math.min(auditLogs.length, 10) : 0,
        departmentBreakdown,
        statusBreakdown: statusBreakdown as Record<string, number>,
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

  const handleExport = () => {
    try {
      const blob = new Blob([JSON.stringify(employees, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employees-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${employees.length} employees`);
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  // Show loading skeleton during SSR/before hydration
  if (!mounted) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 lg:col-span-2 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
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
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm text-gray-500">
              <span>
                {stats && stats.totalEmployees > 0
                  ? Math.round((stats.activeEmployees / stats.totalEmployees) * 100)
                  : 0}% of total
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
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
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
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
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
            <Button 
              variant="outline" 
              className="w-full h-auto py-4 flex flex-col gap-2 hover:border-[#00A651] hover:text-[#00A651]"
            >
              <UserPlus className="h-5 w-5" />
              <span className="text-sm">Add Employee</span>
            </Button>
          </Link>
        )}
        {canImport() && (
          <Button 
            variant="outline" 
            className="w-full h-auto py-4 flex flex-col gap-2 hover:border-[#00A651] hover:text-[#00A651]"
            onClick={() => toast.info('Bulk import feature coming soon')}
          >
            <Upload className="h-5 w-5" />
            <span className="text-sm">Bulk Import</span>
          </Button>
        )}
        {canExport() && (
          <Button 
            variant="outline" 
            className="w-full h-auto py-4 flex flex-col gap-2 hover:border-[#00A651] hover:text-[#00A651]"
            onClick={handleExport}
          >
            <Download className="h-5 w-5" />
            <span className="text-sm">Export Data</span>
          </Button>
        )}
        {canViewAudit() && (
          <Link href="/audit">
            <Button 
              variant="outline" 
              className="w-full h-auto py-4 flex flex-col gap-2 hover:border-[#00A651] hover:text-[#00A651]"
            >
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
            {recentEmployees.length > 0 ? (
              recentEmployees.map((employee) => (
                <Link key={employee.id} href={`/employees/${employee.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
                          <p className="text-sm text-gray-500 truncate">{employee.jobTitle} • {employee.department}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No employees found</p>
            )}
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
              {recentActivity.length > 0 ? (
                recentActivity.map((log) => (
                  <div key={log.id} className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">{getActionIcon(log.action)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{log.userName}</span>{' '}
                        <span className="text-gray-500">{log.description}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatTimeAgo(log.timestamp)}
          </p>
        </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      {stats && Object.keys(stats.departmentBreakdown).length > 0 && (
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
                  className="p-4 rounded-lg bg-gray-50 text-center hover:bg-gray-100 transition-colors"
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
