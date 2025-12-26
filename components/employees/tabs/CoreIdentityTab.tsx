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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Lock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Employee, CardType, Gender, Race, Religion, MaritalStatus, FieldPermission } from '@/lib/types';
import { validateNRIC, maskNRIC, calculateAge } from '@/lib/validations';
import { NATIONALITIES } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface CoreIdentityTabProps {
  data: Employee;
  onChange: (field: string, value: unknown) => void;
  isEditing: boolean;
  permissions: {
    fullName: FieldPermission;
    alias: FieldPermission;
    nricFin: FieldPermission;
    identityNo: FieldPermission;
    cardType: FieldPermission;
    nationality: FieldPermission;
    dateOfBirth: FieldPermission;
    gender: FieldPermission;
    race: FieldPermission;
    religion: FieldPermission;
    maritalStatus: FieldPermission;
  };
}

const cardTypes: CardType[] = ['NRIC', 'FIN', 'Passport'];
const genders: Gender[] = ['Male', 'Female', 'Other'];
const races: Race[] = ['Chinese', 'Malay', 'Indian', 'Eurasian', 'Others'];
const religions: Religion[] = ['Buddhism', 'Christianity', 'Islam', 'Hinduism', 'Taoism', 'No Religion', 'Others'];
const maritalStatuses: MaritalStatus[] = ['Single', 'Married', 'Divorced', 'Widowed'];

export function CoreIdentityTab({ data, onChange, isEditing, permissions }: CoreIdentityTabProps) {
  const [nricError, setNricError] = useState<string>('');
  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    if (data.dateOfBirth) {
      setAge(calculateAge(data.dateOfBirth));
    }
  }, [data.dateOfBirth]);

  const handleNricChange = (value: string) => {
    onChange('nricFin', value.toUpperCase());
    onChange('identityNo', value.toUpperCase());
    
    if (value.length >= 9) {
      const validation = validateNRIC(value);
      setNricError(validation.valid ? '' : validation.message);
    } else {
      setNricError('');
    }
  };

  const getDisplayValue = (value: string | undefined, permission: FieldPermission, maskFn?: (val: string) => string) => {
    if (!permission.read) return '••••••••';
    if (!value) return '-';
    if (permission.masked && maskFn) return maskFn(value);
    return value;
  };

  const FieldWrapper = ({
    children,
    label,
    required,
    permission,
    error,
  }: {
    children: React.ReactNode;
    label: string;
    required?: boolean;
    permission: FieldPermission;
    error?: string;
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
      </div>
      {children}
      {error && (
        <div className="flex items-center gap-1 text-red-500 text-sm">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Core Identity Information
              <Badge variant="outline" className="text-xs">
                Restricted
              </Badge>
            </CardTitle>
            <CardDescription>
              Personal identification details as per official documents
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Full Name */}
          <FieldWrapper label="Full Name (per Identity Card)" required permission={permissions.fullName}>
            {isEditing && permissions.fullName.write ? (
              <Input
                value={data.fullName}
                onChange={(e) => onChange('fullName', e.target.value)}
                placeholder="Enter full name"
              />
            ) : (
              <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                {getDisplayValue(data.fullName, permissions.fullName)}
              </div>
            )}
          </FieldWrapper>

          {/* Alias */}
          <FieldWrapper label="Alias" permission={permissions.alias}>
            {isEditing && permissions.alias.write ? (
              <Input
                value={data.alias || ''}
                onChange={(e) => onChange('alias', e.target.value)}
                placeholder="Preferred name"
              />
            ) : (
              <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                {getDisplayValue(data.alias, permissions.alias)}
              </div>
            )}
          </FieldWrapper>

          {/* Card Type */}
          <FieldWrapper label="Card Type" required permission={permissions.cardType}>
            {isEditing && permissions.cardType.write ? (
              <Select value={data.cardType} onValueChange={(v) => onChange('cardType', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select card type" />
                </SelectTrigger>
                <SelectContent>
                  {cardTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                {getDisplayValue(data.cardType, permissions.cardType)}
              </div>
            )}
          </FieldWrapper>

          {/* NRIC/FIN */}
          <FieldWrapper label="NRIC/FIN" required permission={permissions.nricFin} error={nricError}>
            {isEditing && permissions.nricFin.write ? (
              <Input
                value={data.nricFin}
                onChange={(e) => handleNricChange(e.target.value)}
                placeholder="S1234567A"
                maxLength={9}
                className={cn(nricError && 'border-red-500')}
              />
            ) : (
              <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                {getDisplayValue(data.nricFin, permissions.nricFin, maskNRIC)}
              </div>
            )}
          </FieldWrapper>

          {/* Identity No */}
          <FieldWrapper label="Identity No" required permission={permissions.identityNo}>
            {isEditing && permissions.identityNo.write ? (
              <Input
                value={data.identityNo}
                onChange={(e) => onChange('identityNo', e.target.value.toUpperCase())}
                placeholder="S1234567A"
                maxLength={9}
              />
            ) : (
              <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                {getDisplayValue(data.identityNo, permissions.identityNo, maskNRIC)}
              </div>
            )}
          </FieldWrapper>

          {/* Nationality */}
          <FieldWrapper label="Nationality" required permission={permissions.nationality}>
            {isEditing && permissions.nationality.write ? (
              <Select value={data.nationality} onValueChange={(v) => onChange('nationality', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select nationality" />
                </SelectTrigger>
                <SelectContent>
                  {NATIONALITIES.map((nat) => (
                    <SelectItem key={nat} value={nat}>
                      {nat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                {getDisplayValue(data.nationality, permissions.nationality)}
              </div>
            )}
          </FieldWrapper>

          {/* Date of Birth */}
          <FieldWrapper label="Date of Birth" required permission={permissions.dateOfBirth}>
            {isEditing && permissions.dateOfBirth.write ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !data.dateOfBirth && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.dateOfBirth ? format(new Date(data.dateOfBirth), 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data.dateOfBirth ? new Date(data.dateOfBirth) : undefined}
                    onSelect={(date) => onChange('dateOfBirth', date?.toISOString().split('T')[0])}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <div className="h-10 flex items-center justify-between px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                <span>
                  {data.dateOfBirth && permissions.dateOfBirth.read
                    ? format(new Date(data.dateOfBirth), 'PPP')
                    : '-'}
                </span>
                {age !== null && permissions.dateOfBirth.read && (
                  <Badge variant="secondary">{age} years old</Badge>
                )}
              </div>
            )}
          </FieldWrapper>

          {/* Gender */}
          <FieldWrapper label="Gender" permission={permissions.gender}>
            {isEditing && permissions.gender.write ? (
              <Select value={data.gender} onValueChange={(v) => onChange('gender', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {genders.map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                {getDisplayValue(data.gender, permissions.gender)}
              </div>
            )}
          </FieldWrapper>

          {/* Race */}
          <FieldWrapper label="Race" permission={permissions.race}>
            {isEditing && permissions.race.write ? (
              <Select value={data.race} onValueChange={(v) => onChange('race', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select race" />
                </SelectTrigger>
                <SelectContent>
                  {races.map((race) => (
                    <SelectItem key={race} value={race}>
                      {race}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                {getDisplayValue(data.race, permissions.race)}
              </div>
            )}
          </FieldWrapper>

          {/* Religion */}
          <FieldWrapper label="Religion" permission={permissions.religion}>
            {isEditing && permissions.religion.write ? (
              <Select value={data.religion} onValueChange={(v) => onChange('religion', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select religion" />
                </SelectTrigger>
                <SelectContent>
                  {religions.map((religion) => (
                    <SelectItem key={religion} value={religion}>
                      {religion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                {getDisplayValue(data.religion, permissions.religion)}
              </div>
            )}
          </FieldWrapper>

          {/* Marital Status */}
          <FieldWrapper label="Marital Status" permission={permissions.maritalStatus}>
            {isEditing && permissions.maritalStatus.write ? (
              <Select value={data.maritalStatus} onValueChange={(v) => onChange('maritalStatus', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {maritalStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                {getDisplayValue(data.maritalStatus, permissions.maritalStatus)}
              </div>
            )}
          </FieldWrapper>
        </div>
      </CardContent>
    </Card>
  );
}

