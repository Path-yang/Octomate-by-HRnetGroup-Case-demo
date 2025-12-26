'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Briefcase,
  Phone,
  Wallet,
  GraduationCap,
  Heart,
  Save,
  RotateCcw,
  Check,
  Loader2,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { Employee } from '@/lib/types';
import { usePermissions } from '@/hooks/usePermissions';
import { CoreIdentityTab } from './tabs/CoreIdentityTab';
import { EmploymentTab } from './tabs/EmploymentTab';
import { ContactTab } from './tabs/ContactTab';
import { BankingTab } from './tabs/BankingTab';
import { QualificationsTab } from './tabs/QualificationsTab';
import { EmergencyContactsTab } from './tabs/EmergencyContactsTab';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProfileFormProps {
  employee: Employee;
  onSave: (employee: Employee) => void;
  onAuditLog?: (field: string, oldValue: string, newValue: string) => void;
  isNew?: boolean;
}

const tabs = [
  { id: 'core', label: 'Core Identity', icon: User, restricted: true },
  { id: 'employment', label: 'Employment', icon: Briefcase },
  { id: 'contact', label: 'Contact', icon: Phone },
  { id: 'banking', label: 'Banking', icon: Wallet, sensitive: true },
  { id: 'qualifications', label: 'Qualifications', icon: GraduationCap },
  { id: 'emergency', label: 'Emergency', icon: Heart },
];

export function ProfileForm({ employee, onSave, onAuditLog, isNew = false }: ProfileFormProps) {
  const [formData, setFormData] = useState<Employee>(employee);
  const [originalData, setOriginalData] = useState<Employee>(employee);
  const [activeTab, setActiveTab] = useState('core');
  const [isEditing, setIsEditing] = useState(isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  const { currentRole, getTabPermissions, canEdit, isSelfProfile } = usePermissions();
  const permissions = getTabPermissions(employee.id);
  const canEditProfile = canEdit(employee.id);
  const isSelf = isSelfProfile(employee.id);

  // Calculate form completion percentage
  const calculateCompletion = useCallback(() => {
    const requiredFields = [
      formData.fullName,
      formData.nricFin,
      formData.identityNo,
      formData.workEmail,
      formData.dateOfBirth,
      formData.department,
    ];
    const optionalFields = [
      formData.alias,
      formData.contactNo,
      formData.personalEmail,
      formData.mailingAddress?.addressLine1,
      formData.bankingInfo?.accountNumber,
      formData.emergencyContact1?.name,
    ];

    const requiredFilled = requiredFields.filter(Boolean).length;
    const optionalFilled = optionalFields.filter(Boolean).length;

    return Math.round(
      ((requiredFilled / requiredFields.length) * 70 +
        (optionalFilled / optionalFields.length) * 30)
    );
  }, [formData]);

  const [completion, setCompletion] = useState(calculateCompletion());

  useEffect(() => {
    setCompletion(calculateCompletion());
  }, [formData, calculateCompletion]);

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(changed);
    if (changed && autoSaveStatus === 'saved') {
      setAutoSaveStatus('unsaved');
    }
  }, [formData, originalData, autoSaveStatus]);

  const handleFieldChange = useCallback((field: string, value: unknown) => {
    setFormData((prev) => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      }
      
      // Handle nested fields
      const newData = { ...prev };
      let current: Record<string, unknown> = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...(current[keys[i]] as Record<string, unknown> || {}) };
        current = current[keys[i]] as Record<string, unknown>;
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setAutoSaveStatus('saving');

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Log changes for audit
      if (onAuditLog) {
        Object.keys(formData).forEach((key) => {
          const oldVal = originalData[key as keyof Employee];
          const newVal = formData[key as keyof Employee];
          if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
            onAuditLog(
              key,
              typeof oldVal === 'object' ? JSON.stringify(oldVal) : String(oldVal || ''),
              typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal || '')
            );
          }
        });
      }

      onSave({ ...formData, updatedAt: new Date().toISOString() });
      setOriginalData(formData);
      setAutoSaveStatus('saved');
      setIsEditing(false);
      toast.success('Profile saved successfully');
    } catch (error) {
      toast.error('Failed to save profile');
      setAutoSaveStatus('unsaved');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(originalData);
    setAutoSaveStatus('saved');
    toast.info('Changes discarded');
  };

  const handleStartEdit = () => {
    if (!canEditProfile) {
      toast.error('You do not have permission to edit this profile');
      return;
    }
    setIsEditing(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with save status and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-xl p-4 border shadow-sm">
        <div className="flex items-center gap-4">
          {/* Completion indicator */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-sm text-gray-500">{completion}%</span>
            </div>
            <Progress value={completion} className="h-2 w-32" />
          </div>

          {/* Auto-save status */}
          <div className="flex items-center gap-2 text-sm">
            {autoSaveStatus === 'saved' && (
              <>
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-gray-500">All changes saved</span>
              </>
            )}
            {autoSaveStatus === 'saving' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-gray-500">Saving...</span>
              </>
            )}
            {autoSaveStatus === 'unsaved' && (
              <>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-amber-600">Unsaved changes</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button
              onClick={handleStartEdit}
              disabled={!canEditProfile}
              className="bg-[#00A651] hover:bg-[#008541]"
            >
              Edit Profile
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleReset} disabled={isSaving}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Discard
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="bg-[#00A651] hover:bg-[#008541]"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Role-based access notice */}
      {currentRole !== 'hr_admin' && (
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <Shield className="h-5 w-5 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              {currentRole === 'manager' && 'Manager View: Read-only access. Some fields are masked.'}
              {currentRole === 'employee' && isSelf && 'Self-Service: You can edit contact and emergency information.'}
              {currentRole === 'employee' && !isSelf && 'Access Denied: You can only view your own profile.'}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {tabs.map((tab) => {
            // Hide banking tab for managers
            if (tab.id === 'banking' && !permissions.banking.visible) {
              return null;
            }

            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  'flex-1 min-w-[120px] flex items-center gap-2 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md transition-all',
                  tab.sensitive && 'relative'
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.restricted && (
                  <Badge variant="outline" className="text-[9px] px-1 py-0 hidden lg:flex">
                    Restricted
                  </Badge>
                )}
                {tab.sensitive && permissions.banking.visible && (
                  <Badge variant="destructive" className="text-[9px] px-1 py-0 hidden lg:flex">
                    Sensitive
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="core" className="mt-0">
          <CoreIdentityTab
            data={formData}
            onChange={handleFieldChange}
            isEditing={isEditing}
            permissions={permissions.coreIdentity}
          />
        </TabsContent>

        <TabsContent value="employment" className="mt-0">
          <EmploymentTab
            data={formData}
            onChange={handleFieldChange}
            isEditing={isEditing}
            permissions={permissions.employment}
          />
        </TabsContent>

        <TabsContent value="contact" className="mt-0">
          <ContactTab
            data={formData}
            onChange={handleFieldChange}
            isEditing={isEditing}
            permissions={permissions.contact}
          />
        </TabsContent>

        {permissions.banking.visible && (
          <TabsContent value="banking" className="mt-0">
            <BankingTab
              data={formData}
              onChange={handleFieldChange}
              isEditing={isEditing}
              permissions={permissions.banking}
            />
          </TabsContent>
        )}

        <TabsContent value="qualifications" className="mt-0">
          <QualificationsTab
            data={formData}
            onChange={handleFieldChange}
            isEditing={isEditing}
            permissions={permissions.qualifications}
          />
        </TabsContent>

        <TabsContent value="emergency" className="mt-0">
          <EmergencyContactsTab
            data={formData}
            onChange={handleFieldChange}
            isEditing={isEditing}
            permissions={permissions.emergencyContacts}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

