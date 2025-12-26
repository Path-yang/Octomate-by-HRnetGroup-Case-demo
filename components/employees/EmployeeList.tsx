'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  UserPlus,
  Users,
} from 'lucide-react';
import { Employee, EmploymentStatus, FilterOptions } from '@/lib/types';
import { DEPARTMENTS } from '@/lib/mock-data';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EmployeeListProps {
  employees: Employee[];
  isLoading?: boolean;
  onExport?: (ids: string[]) => void;
}

const ITEMS_PER_PAGE = 10;
const employmentStatuses: EmploymentStatus[] = [
  'Active',
  'Resigned',
  'Retired',
  'Terminated',
  'On Leave',
  'Probation',
];

export function EmployeeList({ employees, isLoading = false, onExport }: EmployeeListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    department: undefined,
    status: undefined,
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const [currentPage, setCurrentPage] = useState(1);

  const { currentRole, canView, canEdit, canExport } = usePermissions();

  // Filter and sort employees
  const filteredEmployees = useMemo(() => {
    let result = [...employees];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (emp) =>
          emp.fullName.toLowerCase().includes(search) ||
          emp.employeeId.toLowerCase().includes(search) ||
          emp.workEmail.toLowerCase().includes(search) ||
          emp.department.toLowerCase().includes(search)
      );
    }

    // Department filter
    if (filters.department) {
      result = result.filter((emp) => emp.department === filters.department);
    }

    // Status filter
    if (filters.status) {
      result = result.filter((emp) => emp.employmentStatus === filters.status);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      switch (filters.sortBy) {
        case 'name':
          aVal = a.fullName;
          bVal = b.fullName;
          break;
        case 'employeeId':
          aVal = a.employeeId;
          bVal = b.employeeId;
          break;
        case 'department':
          aVal = a.department;
          bVal = b.department;
          break;
        case 'status':
          aVal = a.employmentStatus;
          bVal = b.employmentStatus;
          break;
        case 'updatedAt':
          aVal = new Date(a.updatedAt).getTime();
          bVal = new Date(b.updatedAt).getTime();
          break;
      }

      if (typeof aVal === 'string') {
        return filters.sortOrder === 'asc'
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal);
      }
      return filters.sortOrder === 'asc' ? aVal - (bVal as number) : (bVal as number) - aVal;
    });

    return result;
  }, [employees, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedEmployees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedEmployees.map((emp) => emp.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    if (!canExport()) {
      toast.error('You do not have permission to export data');
      return;
    }
    onExport?.(selectedIds.length > 0 ? selectedIds : filteredEmployees.map((e) => e.id));
    toast.success(`Exported ${selectedIds.length > 0 ? selectedIds.length : filteredEmployees.length} employees`);
  };

  const handleSort = (column: FilterOptions['sortBy']) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getStatusBadgeVariant = (status: EmploymentStatus): 'default' | 'secondary' | 'outline' | 'destructive' => {
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

  const SortButton = ({
    column,
    children,
  }: {
    column: FilterOptions['sortBy'];
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={() => handleSort(column)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="border rounded-lg">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b last:border-b-0">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
        <Users className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No Employees Found
        </h3>
        <p className="text-gray-500 text-center max-w-md mb-4">
          Get started by adding your first employee to the system.
        </p>
        <Link href="/employees/new">
          <Button className="bg-[#00A651] hover:bg-[#008541]">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, ID, or email..."
            value={filters.search}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, search: e.target.value }));
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
        <Select
          value={filters.department || 'all'}
          onValueChange={(v) => {
            setFilters((prev) => ({ ...prev, department: v === 'all' ? undefined : v }));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {DEPARTMENTS.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status || 'all'}
          onValueChange={(v) => {
            setFilters((prev) => ({
              ...prev,
              status: v === 'all' ? undefined : (v as EmploymentStatus),
            }));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {employmentStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {canExport() && (
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
            {selectedIds.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedIds.length}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Showing {paginatedEmployees.length} of {filteredEmployees.length} employees
        </span>
        {selectedIds.length > 0 && (
          <span className="text-[#00A651]">{selectedIds.length} selected</span>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === paginatedEmployees.length && paginatedEmployees.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>
                <SortButton column="name">Employee</SortButton>
              </TableHead>
              <TableHead>
                <SortButton column="employeeId">Employee ID</SortButton>
              </TableHead>
              <TableHead>
                <SortButton column="department">Department</SortButton>
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>
                <SortButton column="status">Status</SortButton>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEmployees.map((employee) => (
              <TableRow
                key={employee.id}
                className={cn(
                  'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                  selectedIds.includes(employee.id) && 'bg-[#00A651]/5'
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(employee.id)}
                    onCheckedChange={() => toggleSelect(employee.id)}
                  />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/employees/${employee.id}`}
                    className="flex items-center gap-3 hover:underline"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={employee.photoUrl} />
                      <AvatarFallback className="bg-[#00A651]/10 text-[#00A651] text-sm">
                        {employee.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{employee.fullName}</p>
                      <p className="text-sm text-gray-500">{employee.jobTitle}</p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">{employee.employeeId}</span>
                </TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {employee.workEmail}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(employee.employmentStatus)}>
                    {employee.employmentStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/employees/${employee.id}`} className="cursor-pointer">
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </Link>
                      </DropdownMenuItem>
                      {canEdit(employee.id) && (
                        <DropdownMenuItem asChild>
                          <Link href={`/employees/${employee.id}?edit=true`} className="cursor-pointer">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Link>
                        </DropdownMenuItem>
                      )}
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? 'bg-[#00A651] hover:bg-[#008541]' : ''}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

