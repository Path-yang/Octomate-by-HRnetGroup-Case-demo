'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  FileText,
  Search,
  Filter,
  CalendarIcon,
  Download,
  UserPlus,
  Edit,
  Eye,
  Trash2,
  Upload,
  Shield,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { usePermissions } from '@/hooks/usePermissions';
import { mockAuditLogs } from '@/lib/mock-data';
import { AuditLogEntry, UserRole } from '@/lib/types';
import { getRoleDisplayName } from '@/lib/permissions';
import { format, formatDistanceToNow, isWithinInterval, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function AuditPage() {
  const [auditLogs, setAuditLogs] = useLocalStorage<AuditLogEntry[]>('octomate_audit_logs', []);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const { canViewAudit, currentRole } = usePermissions();

  // Initialize with mock data if empty
  useEffect(() => {
    const timer = setTimeout(() => {
      if (auditLogs.length === 0) {
        setAuditLogs(mockAuditLogs);
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [auditLogs.length, setAuditLogs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    let result = [...auditLogs];

    // Search filter
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

    // Action filter
    if (actionFilter !== 'all') {
      result = result.filter((log) => log.action === actionFilter);
    }

    // Date filter
    if (dateFrom || dateTo) {
      result = result.filter((log) => {
        const logDate = parseISO(log.timestamp);
        if (dateFrom && dateTo) {
          return isWithinInterval(logDate, { start: dateFrom, end: dateTo });
        } else if (dateFrom) {
          return logDate >= dateFrom;
        } else if (dateTo) {
          return logDate <= dateTo;
        }
        return true;
      });
    }

    return result;
  }, [auditLogs, searchTerm, actionFilter, dateFrom, dateTo]);

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
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'update':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'view':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      case 'export':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'delete':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
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
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActionFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
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

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
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

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full lg:w-40 justify-start">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateFrom ? format(dateFrom, 'MMM d') : 'From'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full lg:w-40 justify-start">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateTo ? format(dateTo, 'MMM d') : 'To'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {(searchTerm || actionFilter !== 'all' || dateFrom || dateTo) && (
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
              {searchTerm || actionFilter !== 'all' || dateFrom || dateTo
                ? 'No logs match your current filters. Try adjusting your search criteria.'
                : 'No activity has been logged yet. Actions will appear here as they occur.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log, index) => (
            <Card
              key={log.id}
              className={cn(
                'hover:shadow-md transition-all duration-300 animate-slide-in',
                `stagger-${Math.min(index + 1, 5)}`
              )}
            >
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
                        By <span className="font-medium text-gray-700 dark:text-gray-300">{log.userName}</span>
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
                      <span title={format(new Date(log.timestamp), 'PPpp')}>
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </span>
                    </div>

                    {/* Field Changes */}
                    {log.field && (log.oldValue || log.newValue) && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                        <p className="text-gray-500 mb-2">
                          Field: <span className="font-medium text-gray-700 dark:text-gray-300">{log.field}</span>
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-red-600 dark:text-red-400 line-through truncate max-w-xs">
                            {log.oldValue || 'Empty'}
                          </span>
                          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-green-600 dark:text-green-400 truncate max-w-xs">
                            {log.newValue || 'Empty'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="hidden lg:block text-right text-sm text-gray-500">
                    <p>{format(new Date(log.timestamp), 'MMM d, yyyy')}</p>
                    <p>{format(new Date(log.timestamp), 'h:mm a')}</p>
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

