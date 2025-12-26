'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Phone, Lock, ChevronDown, Globe, MapPin } from 'lucide-react';
import { Employee, FieldPermission } from '@/lib/types';
import { validateSGPhone, validateSGPostalCode, validateEmail, formatSGPhone } from '@/lib/validations';
import { cn } from '@/lib/utils';

interface ContactTabProps {
  data: Employee;
  onChange: (field: string, value: unknown) => void;
  isEditing: boolean;
  permissions: {
    contactNo: FieldPermission;
    homeNo: FieldPermission;
    personalEmail: FieldPermission;
    mailingAddress: FieldPermission;
    overseasAddress: FieldPermission;
  };
}

export function ContactTab({ data, onChange, isEditing, permissions }: ContactTabProps) {
  const [overseasOpen, setOverseasOpen] = useState(!!data.overseasAddress?.addressLine);
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [postalError, setPostalError] = useState('');

  const handlePhoneChange = (value: string) => {
    onChange('contactNo', value);
    if (value) {
      const result = validateSGPhone(value, 'mobile');
      setPhoneError(result.valid ? '' : result.message);
    } else {
      setPhoneError('');
    }
  };

  const handleEmailChange = (value: string) => {
    onChange('personalEmail', value);
    if (value) {
      const result = validateEmail(value);
      setEmailError(result.valid ? '' : result.message);
    } else {
      setEmailError('');
    }
  };

  const handlePostalChange = (value: string) => {
    onChange('mailingAddress.postalCode', value);
    if (value) {
      const result = validateSGPostalCode(value);
      setPostalError(result.valid ? '' : result.message);
    } else {
      setPostalError('');
    }
  };

  const getDisplayValue = (value: string | undefined, permission: FieldPermission) => {
    if (!permission.read) return '••••••••';
    if (!value) return '-';
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
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Phone className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Phone numbers, email, and address details
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Phone Numbers & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Contact No (Mobile) */}
          <FieldWrapper label="Contact No. (Mobile)" permission={permissions.contactNo} error={phoneError}>
            {isEditing && permissions.contactNo.write ? (
              <Input
                value={data.contactNo || ''}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+65 9123 4567"
                onBlur={() => {
                  if (data.contactNo) {
                    onChange('contactNo', formatSGPhone(data.contactNo));
                  }
                }}
              />
            ) : (
              <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                {getDisplayValue(data.contactNo, permissions.contactNo)}
              </div>
            )}
          </FieldWrapper>

          {/* Home No */}
          <FieldWrapper label="Home No." permission={permissions.homeNo}>
            {isEditing && permissions.homeNo.write ? (
              <Input
                value={data.homeNo || ''}
                onChange={(e) => onChange('homeNo', e.target.value)}
                placeholder="+65 6123 4567"
              />
            ) : (
              <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                {getDisplayValue(data.homeNo, permissions.homeNo)}
              </div>
            )}
          </FieldWrapper>

          {/* Personal Email */}
          <FieldWrapper label="Personal Email" permission={permissions.personalEmail} error={emailError}>
            {isEditing && permissions.personalEmail.write ? (
              <Input
                type="email"
                value={data.personalEmail || ''}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="personal@email.com"
              />
            ) : (
              <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                {getDisplayValue(data.personalEmail, permissions.personalEmail)}
              </div>
            )}
          </FieldWrapper>
        </div>

        {/* Mailing Address */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <h4 className="font-medium">Mailing Address</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
            {/* Address Line 1 */}
            <FieldWrapper label="Address Line 1" permission={permissions.mailingAddress}>
              {isEditing && permissions.mailingAddress.write ? (
                <Input
                  value={data.mailingAddress?.addressLine1 || ''}
                  onChange={(e) => onChange('mailingAddress.addressLine1', e.target.value)}
                  placeholder="Block/Street address"
                />
              ) : (
                <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                  {getDisplayValue(data.mailingAddress?.addressLine1, permissions.mailingAddress)}
                </div>
              )}
            </FieldWrapper>

            {/* Address Line 2 */}
            <FieldWrapper label="Address Line 2" permission={permissions.mailingAddress}>
              {isEditing && permissions.mailingAddress.write ? (
                <Input
                  value={data.mailingAddress?.addressLine2 || ''}
                  onChange={(e) => onChange('mailingAddress.addressLine2', e.target.value)}
                  placeholder="Unit number (optional)"
                />
              ) : (
                <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                  {getDisplayValue(data.mailingAddress?.addressLine2, permissions.mailingAddress)}
                </div>
              )}
            </FieldWrapper>

            {/* Postal Code */}
            <FieldWrapper label="Postal Code" permission={permissions.mailingAddress} error={postalError}>
              {isEditing && permissions.mailingAddress.write ? (
                <Input
                  value={data.mailingAddress?.postalCode || ''}
                  onChange={(e) => handlePostalChange(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                />
              ) : (
                <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                  {getDisplayValue(data.mailingAddress?.postalCode, permissions.mailingAddress)}
                </div>
              )}
            </FieldWrapper>
          </div>
        </div>

        {/* Overseas Address (Collapsible) */}
        <Collapsible open={overseasOpen} onOpenChange={setOverseasOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Overseas Address</span>
                {data.overseasAddress?.addressLine && (
                  <span className="text-sm text-gray-500">(Configured)</span>
                )}
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                overseasOpen && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              {/* Overseas Address Line */}
              <FieldWrapper label="Overseas Address" permission={permissions.overseasAddress}>
                {isEditing && permissions.overseasAddress.write ? (
                  <Input
                    value={data.overseasAddress?.addressLine || ''}
                    onChange={(e) => onChange('overseasAddress.addressLine', e.target.value)}
                    placeholder="Full address"
                  />
                ) : (
                  <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                    {getDisplayValue(data.overseasAddress?.addressLine, permissions.overseasAddress)}
                  </div>
                )}
              </FieldWrapper>

              {/* Overseas Postal Code */}
              <FieldWrapper label="Overseas Postal Code" permission={permissions.overseasAddress}>
                {isEditing && permissions.overseasAddress.write ? (
                  <Input
                    value={data.overseasAddress?.postalCode || ''}
                    onChange={(e) => onChange('overseasAddress.postalCode', e.target.value)}
                    placeholder="Postal code"
                  />
                ) : (
                  <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                    {getDisplayValue(data.overseasAddress?.postalCode, permissions.overseasAddress)}
                  </div>
                )}
              </FieldWrapper>

              {/* Country */}
              <FieldWrapper label="Country" permission={permissions.overseasAddress}>
                {isEditing && permissions.overseasAddress.write ? (
                  <Input
                    value={data.overseasAddress?.country || ''}
                    onChange={(e) => onChange('overseasAddress.country', e.target.value)}
                    placeholder="Country name"
                  />
                ) : (
                  <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                    {getDisplayValue(data.overseasAddress?.country, permissions.overseasAddress)}
                  </div>
                )}
              </FieldWrapper>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

