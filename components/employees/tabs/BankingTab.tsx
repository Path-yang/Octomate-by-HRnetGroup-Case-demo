'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Wallet, Lock, ShieldAlert, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Employee, FieldPermission } from '@/lib/types';
import { maskBankAccount, validateBankAccount, validateSwiftCode } from '@/lib/validations';
import { BANKS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BankingTabProps {
  data: Employee;
  onChange: (field: string, value: unknown) => void;
  isEditing: boolean;
  permissions: {
    visible: boolean;
    allFields: FieldPermission;
  };
}

const countries = ['Singapore', 'Malaysia', 'Indonesia', 'Philippines', 'Vietnam', 'Thailand', 'India', 'China', 'Australia', 'United Kingdom', 'United States'];

export function BankingTab({ data, onChange, isEditing, permissions }: BankingTabProps) {
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [pendingChange, setPendingChange] = useState<{ field: string; value: string } | null>(null);
  const [accountError, setAccountError] = useState('');
  const [swiftError, setSwiftError] = useState('');

  const canEdit = permissions.allFields.write && isEditing;
  const canView = permissions.allFields.read;

  const handleSensitiveChange = (field: string, value: string) => {
    // For sensitive fields, show confirmation dialog
    if (field === 'bankingInfo.accountNumber' || field === 'bankingInfo.bicSwiftCode') {
      setPendingChange({ field, value });
      setConfirmDialog(true);
    } else {
      onChange(field, value);
    }
  };

  const confirmChange = () => {
    if (pendingChange) {
      onChange(pendingChange.field, pendingChange.value);
      toast.success('Banking information updated');
    }
    setConfirmDialog(false);
    setPendingChange(null);
  };

  const handleAccountChange = (value: string) => {
    handleSensitiveChange('bankingInfo.accountNumber', value);
    const result = validateBankAccount(value);
    setAccountError(result.valid ? '' : result.message);
  };

  const handleSwiftChange = (value: string) => {
    handleSensitiveChange('bankingInfo.bicSwiftCode', value.toUpperCase());
    const result = validateSwiftCode(value);
    setSwiftError(result.valid ? '' : result.message);
  };

  const handleBankChange = (bankCode: string) => {
    const bank = BANKS.find((b) => b.code === bankCode);
    if (bank) {
      onChange('bankingInfo.bankEntity', bank.name);
      onChange('bankingInfo.bicSwiftCode', bank.swift);
    }
  };

  const getDisplayValue = (value: string | undefined, isMasked = false) => {
    if (!canView) return '••••••••';
    if (!value) return '-';
    if (isMasked && !showAccountNumber) return maskBankAccount(value);
    return value;
  };

  const FieldWrapper = ({
    children,
    label,
    required,
    error,
    isSensitive,
  }: {
    children: React.ReactNode;
    label: string;
    required?: boolean;
    error?: string;
    isSensitive?: boolean;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className={cn(!canView && 'text-gray-400')}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {!canEdit && canView && (
          <Lock className="h-3 w-3 text-gray-400" />
        )}
        {isSensitive && (
          <Badge variant="destructive" className="text-[9px] px-1.5 py-0">
            Sensitive
          </Badge>
        )}
      </div>
      {children}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );

  if (!permissions.visible) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShieldAlert className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Access Restricted
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            Banking information is only visible to HR Administrators.
            Contact your HR department if you need to update this information.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="animate-fade-in border-t-4 border-t-[#FF5722]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#FF5722]/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-[#FF5722]" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Banking & Payroll
                  <Badge variant="destructive" className="text-xs bg-[#FF5722] border-[#FF5722]">
                    🔒🔒 Highly Restricted
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Bank account details for salary disbursement
                </CardDescription>
                {data.updatedAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    Last modified: {new Date(data.updatedAt).toLocaleDateString('en-SG', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Security Notice */}
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              This section contains sensitive financial information. All changes are logged for security purposes.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Name per Bank Account */}
            <FieldWrapper label="Name (per Bank Account)" required>
              {canEdit ? (
                <Input
                  value={data.bankingInfo?.namePerBankAccount || ''}
                  onChange={(e) => onChange('bankingInfo.namePerBankAccount', e.target.value.toUpperCase())}
                  placeholder="FULL NAME AS PER BANK"
                  className="uppercase"
                />
              ) : (
                <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                  {getDisplayValue(data.bankingInfo?.namePerBankAccount)}
                </div>
              )}
            </FieldWrapper>

            {/* Bank Country */}
            <FieldWrapper label="Bank Country">
              {canEdit ? (
                <Select 
                  value={data.bankingInfo?.bankCountry || ''} 
                  onValueChange={(v) => onChange('bankingInfo.bankCountry', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                  {getDisplayValue(data.bankingInfo?.bankCountry)}
                </div>
              )}
            </FieldWrapper>

            {/* Bank Entity */}
            <FieldWrapper label="Full Bank Entity">
              {canEdit ? (
                <Select 
                  value={BANKS.find(b => b.name === data.bankingInfo?.bankEntity)?.code || ''}
                  onValueChange={handleBankChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANKS.map((bank) => (
                      <SelectItem key={bank.code} value={bank.code}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                  {getDisplayValue(data.bankingInfo?.bankEntity)}
                </div>
              )}
            </FieldWrapper>

            {/* Branch Code */}
            <FieldWrapper label="Branch Code" required>
              {canEdit ? (
                <Input
                  value={data.bankingInfo?.branchCode || ''}
                  onChange={(e) => onChange('bankingInfo.branchCode', e.target.value)}
                  placeholder="001"
                  maxLength={5}
                />
              ) : (
                <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                  {getDisplayValue(data.bankingInfo?.branchCode)}
                </div>
              )}
            </FieldWrapper>

            {/* Account Number */}
            <FieldWrapper label="Account Number" required isSensitive error={accountError}>
              {canEdit ? (
                <div className="relative">
                  <Input
                    type={showAccountNumber ? 'text' : 'password'}
                    value={data.bankingInfo?.accountNumber || ''}
                    onChange={(e) => handleAccountChange(e.target.value)}
                    placeholder="1234567890"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowAccountNumber(!showAccountNumber)}
                  >
                    {showAccountNumber ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ) : (
                <div className="h-10 flex items-center justify-between px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                  <span className="font-mono">
                    {getDisplayValue(data.bankingInfo?.accountNumber, true)}
                  </span>
                  {canView && data.bankingInfo?.accountNumber && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setShowAccountNumber(!showAccountNumber)}
                    >
                      {showAccountNumber ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              )}
            </FieldWrapper>

            {/* BIC/SWIFT Code */}
            <FieldWrapper label="BIC/SWIFT Code" required isSensitive error={swiftError}>
              {canEdit ? (
                <Input
                  value={data.bankingInfo?.bicSwiftCode || ''}
                  onChange={(e) => handleSwiftChange(e.target.value)}
                  placeholder="DBSSSGSG"
                  className="uppercase font-mono"
                  maxLength={11}
                />
              ) : (
                <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border font-mono">
                  {getDisplayValue(data.bankingInfo?.bicSwiftCode)}
                </div>
              )}
            </FieldWrapper>
          </div>

          {/* Request Change Button for Self-Service */}
          {!canEdit && canView && (
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => toast.info('Change request submitted to HR')}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Request Banking Update
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              Confirm Sensitive Change
            </DialogTitle>
            <DialogDescription>
              You are about to modify sensitive banking information. This change will be logged in the audit trail.
              Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmChange} className="bg-amber-600 hover:bg-amber-700">
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

