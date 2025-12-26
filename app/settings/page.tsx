'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Download,
  Trash2,
  RefreshCw,
  Info,
  CheckCircle,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { usePermissions } from '@/hooks/usePermissions';
import { mockEmployees, mockAuditLogs } from '@/lib/mock-data';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [employees, setEmployees] = useLocalStorage<any[]>('octomate_employees', []);
  const [auditLogs, setAuditLogs] = useLocalStorage<any[]>('octomate_audit_logs', []);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(true);
  const [auditAlerts, setAuditAlerts] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [retentionPeriod, setRetentionPeriod] = useState('7');

  const { currentUser, currentRole } = usePermissions();

  const handleResetData = () => {
    setEmployees(mockEmployees);
    setAuditLogs(mockAuditLogs);
    toast.success('Data reset to demo defaults');
  };

  const handleClearData = () => {
    setEmployees([]);
    setAuditLogs([]);
    localStorage.removeItem('octomate_employees');
    localStorage.removeItem('octomate_audit_logs');
    toast.success('All local data cleared');
  };

  const handleExportAll = () => {
    const data = {
      employees,
      auditLogs,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `octomate-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Full backup exported successfully');
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <PageHeader
        title="Settings"
        description="Manage your preferences and system configuration"
        breadcrumbs={[{ label: 'Settings' }]}
      />

      {/* Demo Notice */}
      <Alert className="border-[#00A651]/30 bg-[#00A651]/5">
        <Info className="h-4 w-4 text-[#00A651]" />
        <AlertDescription className="text-[#00A651]">
          <strong>Demo Mode:</strong> This is a demonstration of the Octomate HR system.
          All data is stored locally in your browser and will persist across sessions.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Your account information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input value={currentUser.name} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={currentUser.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Current Role</Label>
                  <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                    <Badge className="bg-[#00A651]">
                      {currentRole === 'hr_admin' ? 'HR Administrator' : currentRole === 'manager' ? 'Manager' : 'Employee'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <Input value={currentUser.employeeId || 'N/A'} disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Configure notification preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">System Updates</p>
                  <p className="text-sm text-gray-500">Get notified about system changes</p>
                </div>
                <Switch checked={systemUpdates} onCheckedChange={setSystemUpdates} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Audit Alerts</p>
                  <p className="text-sm text-gray-500">Receive alerts for sensitive changes</p>
                </div>
                <Switch checked={auditAlerts} onCheckedChange={setAuditAlerts} />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Palette className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-save Changes</p>
                  <p className="text-sm text-gray-500">Automatically save form changes</p>
                </div>
                <Switch checked={autoSave} onCheckedChange={setAutoSave} />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Data Retention Period</Label>
                <Select value={retentionPeriod} onValueChange={setRetentionPeriod}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Year</SelectItem>
                    <SelectItem value="3">3 Years</SelectItem>
                    <SelectItem value="5">5 Years</SelectItem>
                    <SelectItem value="7">7 Years (Singapore Default)</SelectItem>
                    <SelectItem value="10">10 Years</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Singapore employment regulations require 7 years minimum retention.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Data Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Database className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Data Management</CardTitle>
                  <CardDescription>Demo data controls</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={handleExportAll}>
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={handleResetData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset to Demo Data
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleClearData}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </Button>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">System Info</CardTitle>
                  <CardDescription>Application details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Framework</span>
                <span className="font-medium">Next.js 14</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Employees</span>
                <span className="font-medium">{employees.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Audit Logs</span>
                <span className="font-medium">{auditLogs.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-gray-500">PDPA Compliant</span>
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Yes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card className="bg-gradient-to-br from-[#00A651]/5 to-[#00A651]/10 border-[#00A651]/20">
            <CardContent className="p-6 text-center">
              <Image
                src="/logo.jpeg"
                alt="Octomate Logo"
                width={64}
                height={64}
                className="rounded-2xl mx-auto mb-4"
              />
              <h3 className="font-bold text-lg mb-1">Octomate by HRnet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Singapore&apos;s Leading HR Tech Solution
              </p>
              <Badge variant="outline" className="border-[#00A651]/30 text-[#00A651]">
                PM Assessment Demo
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

