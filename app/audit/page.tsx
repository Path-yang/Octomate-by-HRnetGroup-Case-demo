'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  FileText,
  Search,
  Filter,
  Download,
  UserPlus,
  Edit,
  Eye,
  Trash2,
  Shield,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { mockAuditLogs } from '@/lib/mock-data';
import { AuditLogEntry, UserRole } from '@/lib/types';
import { getRoleDisplayName } from '@/lib/permissions';
import { cn } from '@/lib/utils';
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

function formatTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-SG', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } catch {
    return '';
  }
}

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

export default function AuditPage() {
  const [mounted, setMounted] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const { canViewAudit } = usePermissions();

  // Initialize data on mount
  useEffect(() => {
    try {
      const storedLogs = localStorage.getItem('octomate_audit_logs');
      if (storedLogs) {
        setAuditLogs(JSON.parse(storedLogs));
      } else {
        setAuditLogs(mockAuditLogs);
        localStorage.setItem('octomate_audit_logs', JSON.stringify(mockAuditLogs));
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
      setAuditLogs(mockAuditLogs);
    }
    setMounted(true);
  }, []);

  // Filter logs
  const filteredLogs = useMemo(() => {
    let result = [...auditLogs];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (log) =>
          log.employeeName.toLowerCase().includes(search) ||
          log.userName.toLowerCase().includes(search) ||
          log.description.toLowerCase().includes(search) ||
          (log.field && log.field.toLowerCase().includes(search))
      );
    }

    if (actionFilter !== 'all') {
      result = result.filter((log) => log.action === actionFilter);
    }

    return result;
  }, [auditLogs, searchTerm, actionFilter]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <UserPlus className="h-4 w-4" />;
      case 'update':
        return <Edit className="h-4 w-4" />;
      case 'view':
        return <Eye className="h-4 w-4" />;
      case 'export':
        return <Download className="h-4 w-4" />;
      case 'delete':
        return <Trash2 className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-700';
      case 'update':
        return 'bg-blue-100 text-blue-700';
      case 'view':
        return 'bg-gray-100 text-gray-700';
      case 'export':
        return 'bg-purple-100 text-purple-700';
      case 'delete':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'hr_admin':
        return 'bg-[#00A651]/10 text-[#00A651] border-[#00A651]/30';
      case 'manager':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'employee':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return '';
    }
  };

  const handleExport = () => {
    try {
      const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${filteredLogs.length} audit log entries`);
    } catch (error) {
      toast.error('Failed to export logs');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActionFilter('all');
  };

  if (!canViewAudit()) {
    return (
      <div className="p-6">
        <PageHeader
          title="Audit Logs"
          breadcrumbs={[{ label: 'Audit Logs' }]}
        />
        <Alert variant="destructive" className="mt-6">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to view audit logs. Only HR Administrators can access this section.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="flex gap-4">
          <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Audit Trail"
        description="Track all changes and activities in the system"
        breadcrumbs={[{ label: 'Audit Logs' }]}
        actions={
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by employee, user, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="export">Export</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || actionFilter !== 'all') && (
              <Button variant="ghost" onClick={clearFilters}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Showing {filteredLogs.length} of {auditLogs.length} entries
        </span>
      </div>

      {/* Timeline */}
      {filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Audit Logs Found</h3>
            <p className="text-gray-500 text-center max-w-md">
              {searchTerm || actionFilter !== 'all'
                ? 'No logs match your current filters. Try adjusting your search criteria.'
                : 'No activity has been logged yet. Actions will appear here as they occur.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Action Icon */}
                  <div
                    className={cn(
                      'flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center',
                      getActionColor(log.action)
                    )}
                  >
                    {getActionIcon(log.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <p className="font-medium">{log.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {log.action}
                        </Badge>
                        <Badge variant="outline" className={getRoleBadgeColor(log.userRole)}>
                          {getRoleDisplayName(log.userRole)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500">
                      <span>
                        By <span className="font-medium text-gray-700">{log.userName}</span>
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span>
                        Employee:{' '}
                        <Link
                          href={`/employees/${log.employeeId}`}
                          className="font-medium text-[#00A651] hover:underline"
                        >
                          {log.employeeName}
                        </Link>
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span>{formatTimeAgo(log.timestamp)}</span>
                    </div>

                    {/* Field Changes */}
                    {log.field && (log.oldValue || log.newValue) && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                        <p className="text-gray-500 mb-2">
                          Field: <span className="font-medium text-gray-700">{log.field}</span>
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-red-600 line-through truncate max-w-xs">
                            {log.oldValue || 'Empty'}
                          </span>
                          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-green-600 truncate max-w-xs">
                            {log.newValue || 'Empty'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="hidden lg:block text-right text-sm text-gray-500">
                    <p>{formatDate(log.timestamp)}</p>
                    <p>{formatTime(log.timestamp)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
