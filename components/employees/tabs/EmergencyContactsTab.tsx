'use client';

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
import { Heart, Lock, User } from 'lucide-react';
import { Employee, Relationship, FieldPermission } from '@/lib/types';
import { cn } from '@/lib/utils';

interface EmergencyContactsTabProps {
  data: Employee;
  onChange: (field: string, value: unknown) => void;
  isEditing: boolean;
  permissions: {
    allFields: FieldPermission;
  };
}

const relationships: Relationship[] = ['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other'];

export function EmergencyContactsTab({
  data,
  onChange,
  isEditing,
  permissions,
}: EmergencyContactsTabProps) {
  const canEdit = permissions.allFields.write && isEditing;
  const canView = permissions.allFields.read;

  const getDisplayValue = (value: string | undefined) => {
    if (!canView) return '••••••••';
    if (!value) return '-';
    return value;
  };

  const FieldWrapper = ({
    children,
    label,
    required,
  }: {
    children: React.ReactNode;
    label: string;
    required?: boolean;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className={cn(!canView && 'text-gray-400')}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {!canEdit && canView && <Lock className="h-3 w-3 text-gray-400" />}
      </div>
      {children}
    </div>
  );

  const ContactCard = ({
    contactNumber,
    title,
    prefix,
  }: {
    contactNumber: 1 | 2;
    title: string;
    prefix: 'emergencyContact1' | 'emergencyContact2';
  }) => {
    const contact = contactNumber === 1 ? data.emergencyContact1 : data.emergencyContact2;

    return (
      <Card className="bg-gray-50/50 dark:bg-gray-800/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <User className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {contact?.name && canView && (
                <CardDescription>{contact.name}</CardDescription>
              )}
            </div>
            {contactNumber === 1 && (
              <Badge variant="outline" className="ml-auto">
                Primary
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <FieldWrapper label={`Name of Contact Point (${contactNumber})`} required={contactNumber === 1}>
              {canEdit ? (
                <Input
                  value={contact?.name || ''}
                  onChange={(e) => onChange(`${prefix}.name`, e.target.value)}
                  placeholder="Contact person's name"
                />
              ) : (
                <div className="h-10 flex items-center px-3 bg-white dark:bg-gray-800 rounded-md border">
                  {getDisplayValue(contact?.name)}
                </div>
              )}
            </FieldWrapper>

            {/* Relationship */}
            <FieldWrapper label={`Relationship (${contactNumber})`}>
              {canEdit ? (
                <Select
                  value={contact?.relationship}
                  onValueChange={(v) => onChange(`${prefix}.relationship`, v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationships.map((rel) => (
                      <SelectItem key={rel} value={rel}>
                        {rel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-10 flex items-center px-3 bg-white dark:bg-gray-800 rounded-md border">
                  {getDisplayValue(contact?.relationship)}
                </div>
              )}
            </FieldWrapper>

            {/* Mobile Number */}
            <FieldWrapper label={`Mobile Number (${contactNumber})`} required={contactNumber === 1}>
              {canEdit ? (
                <Input
                  value={contact?.mobileNumber || ''}
                  onChange={(e) => onChange(`${prefix}.mobileNumber`, e.target.value)}
                  placeholder="+65 9123 4567"
                />
              ) : (
                <div className="h-10 flex items-center px-3 bg-white dark:bg-gray-800 rounded-md border">
                  {getDisplayValue(contact?.mobileNumber)}
                </div>
              )}
            </FieldWrapper>

            {/* Home/Office Number */}
            <FieldWrapper label={`Home/Office Number (${contactNumber})`}>
              {canEdit ? (
                <Input
                  value={contact?.homeOfficeNumber || ''}
                  onChange={(e) => onChange(`${prefix}.homeOfficeNumber`, e.target.value)}
                  placeholder="+65 6123 4567"
                />
              ) : (
                <div className="h-10 flex items-center px-3 bg-white dark:bg-gray-800 rounded-md border">
                  {getDisplayValue(contact?.homeOfficeNumber)}
                </div>
              )}
            </FieldWrapper>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
            <Heart className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <CardTitle>Emergency Contacts</CardTitle>
            <CardDescription>
              People to contact in case of emergency
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <ContactCard
          contactNumber={1}
          title="Emergency Contact 1"
          prefix="emergencyContact1"
        />
        <ContactCard
          contactNumber={2}
          title="Emergency Contact 2"
          prefix="emergencyContact2"
        />
      </CardContent>
    </Card>
  );
}

