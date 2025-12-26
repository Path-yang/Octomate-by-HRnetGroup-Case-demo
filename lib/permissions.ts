// Role-Based Access Control for Octomate HR System

import { UserRole, FieldPermission, TabPermissions, Employee } from './types';

const FULL_ACCESS: FieldPermission = { read: true, write: true, masked: false };
const READ_ONLY: FieldPermission = { read: true, write: false, masked: false };
const MASKED_READ: FieldPermission = { read: true, write: false, masked: true };
const NO_ACCESS: FieldPermission = { read: false, write: false, masked: false };
const SELF_EDIT: FieldPermission = { read: true, write: true, masked: false };
const SELF_READ: FieldPermission = { read: true, write: false, masked: false };

export function getPermissions(role: UserRole, isSelfProfile: boolean = false): TabPermissions {
  switch (role) {
    case 'hr_admin':
      return getHRAdminPermissions();
    case 'manager':
      return getManagerPermissions();
    case 'employee':
      return getEmployeePermissions(isSelfProfile);
    default:
      return getEmployeePermissions(false);
  }
}

function getHRAdminPermissions(): TabPermissions {
  return {
    coreIdentity: {
      fullName: FULL_ACCESS,
      alias: FULL_ACCESS,
      nricFin: FULL_ACCESS,
      identityNo: FULL_ACCESS,
      cardType: FULL_ACCESS,
      nationality: FULL_ACCESS,
      dateOfBirth: FULL_ACCESS,
      gender: FULL_ACCESS,
      race: FULL_ACCESS,
      religion: FULL_ACCESS,
      maritalStatus: FULL_ACCESS,
    },
    employment: {
      workEmail: FULL_ACCESS,
      employeeId: READ_ONLY, // Auto-generated, read-only
      department: FULL_ACCESS,
      jobTitle: FULL_ACCESS,
      employmentDate: FULL_ACCESS,
      retirementAge: FULL_ACCESS,
      retirementYear: READ_ONLY, // Auto-calculated
      retirementDate: READ_ONLY, // Auto-calculated
      reEmploymentDate: FULL_ACCESS,
      employmentStatus: FULL_ACCESS,
    },
    contact: {
      contactNo: FULL_ACCESS,
      homeNo: FULL_ACCESS,
      personalEmail: FULL_ACCESS,
      mailingAddress: FULL_ACCESS,
      overseasAddress: FULL_ACCESS,
    },
    banking: {
      visible: true,
      allFields: FULL_ACCESS,
    },
    qualifications: {
      allFields: FULL_ACCESS,
    },
    emergencyContacts: {
      allFields: FULL_ACCESS,
    },
  };
}

function getManagerPermissions(): TabPermissions {
  return {
    coreIdentity: {
      fullName: READ_ONLY,
      alias: READ_ONLY,
      nricFin: MASKED_READ, // Masked: S****567A
      identityNo: MASKED_READ,
      cardType: READ_ONLY,
      nationality: READ_ONLY,
      dateOfBirth: READ_ONLY,
      gender: READ_ONLY,
      race: READ_ONLY,
      religion: READ_ONLY,
      maritalStatus: READ_ONLY,
    },
    employment: {
      workEmail: READ_ONLY,
      employeeId: READ_ONLY,
      department: READ_ONLY,
      jobTitle: READ_ONLY,
      employmentDate: READ_ONLY,
      retirementAge: READ_ONLY,
      retirementYear: READ_ONLY,
      retirementDate: READ_ONLY,
      reEmploymentDate: READ_ONLY,
      employmentStatus: READ_ONLY,
    },
    contact: {
      contactNo: READ_ONLY,
      homeNo: READ_ONLY,
      personalEmail: READ_ONLY,
      mailingAddress: READ_ONLY,
      overseasAddress: READ_ONLY,
    },
    banking: {
      visible: false, // Completely hidden for managers
      allFields: NO_ACCESS,
    },
    qualifications: {
      allFields: READ_ONLY,
    },
    emergencyContacts: {
      allFields: READ_ONLY,
    },
  };
}

function getEmployeePermissions(isSelfProfile: boolean): TabPermissions {
  if (!isSelfProfile) {
    // Employee viewing someone else's profile - no access
    return {
      coreIdentity: {
        fullName: NO_ACCESS,
        alias: NO_ACCESS,
        nricFin: NO_ACCESS,
        identityNo: NO_ACCESS,
        cardType: NO_ACCESS,
        nationality: NO_ACCESS,
        dateOfBirth: NO_ACCESS,
        gender: NO_ACCESS,
        race: NO_ACCESS,
        religion: NO_ACCESS,
        maritalStatus: NO_ACCESS,
      },
      employment: {
        workEmail: NO_ACCESS,
        employeeId: NO_ACCESS,
        department: NO_ACCESS,
        jobTitle: NO_ACCESS,
        employmentDate: NO_ACCESS,
        retirementAge: NO_ACCESS,
        retirementYear: NO_ACCESS,
        retirementDate: NO_ACCESS,
        reEmploymentDate: NO_ACCESS,
        employmentStatus: NO_ACCESS,
      },
      contact: {
        contactNo: NO_ACCESS,
        homeNo: NO_ACCESS,
        personalEmail: NO_ACCESS,
        mailingAddress: NO_ACCESS,
        overseasAddress: NO_ACCESS,
      },
      banking: {
        visible: false,
        allFields: NO_ACCESS,
      },
      qualifications: {
        allFields: NO_ACCESS,
      },
      emergencyContacts: {
        allFields: NO_ACCESS,
      },
    };
  }

  // Self-service: Can view own profile, edit some fields
  return {
    coreIdentity: {
      fullName: SELF_READ, // Cannot edit
      alias: SELF_EDIT,
      nricFin: SELF_READ, // Cannot edit NRIC
      identityNo: SELF_READ,
      cardType: SELF_READ,
      nationality: SELF_READ,
      dateOfBirth: SELF_READ,
      gender: SELF_READ,
      race: SELF_READ,
      religion: SELF_EDIT,
      maritalStatus: SELF_EDIT,
    },
    employment: {
      workEmail: SELF_READ, // Cannot edit
      employeeId: SELF_READ,
      department: SELF_READ,
      jobTitle: SELF_READ,
      employmentDate: SELF_READ, // Cannot edit
      retirementAge: SELF_READ,
      retirementYear: SELF_READ,
      retirementDate: SELF_READ,
      reEmploymentDate: SELF_READ,
      employmentStatus: SELF_READ,
    },
    contact: {
      contactNo: SELF_EDIT,
      homeNo: SELF_EDIT,
      personalEmail: SELF_EDIT,
      mailingAddress: SELF_EDIT,
      overseasAddress: SELF_EDIT,
    },
    banking: {
      visible: true,
      allFields: SELF_READ, // Can view but must request change
    },
    qualifications: {
      allFields: SELF_EDIT,
    },
    emergencyContacts: {
      allFields: SELF_EDIT,
    },
  };
}

export function canViewEmployee(role: UserRole, employeeId: string, currentUserEmployeeId?: string): boolean {
  switch (role) {
    case 'hr_admin':
      return true;
    case 'manager':
      return true; // Managers can view team members
    case 'employee':
      return employeeId === currentUserEmployeeId; // Can only view self
    default:
      return false;
  }
}

export function canEditEmployee(role: UserRole, employeeId: string, currentUserEmployeeId?: string): boolean {
  switch (role) {
    case 'hr_admin':
      return true;
    case 'manager':
      return false; // Managers cannot edit
    case 'employee':
      return employeeId === currentUserEmployeeId; // Can only edit self (with restrictions)
    default:
      return false;
  }
}

export function canViewAuditLogs(role: UserRole): boolean {
  return role === 'hr_admin';
}

export function canExportData(role: UserRole): boolean {
  return role === 'hr_admin' || role === 'manager';
}

export function canBulkImport(role: UserRole): boolean {
  return role === 'hr_admin';
}

export function canAddEmployee(role: UserRole): boolean {
  return role === 'hr_admin';
}

export function canDeleteEmployee(role: UserRole): boolean {
  return role === 'hr_admin';
}

export function getFieldDisplayValue(
  value: string | undefined,
  permission: FieldPermission,
  maskFn?: (val: string) => string
): string {
  if (!permission.read) {
    return '••••••••';
  }
  
  if (!value) {
    return '-';
  }
  
  if (permission.masked && maskFn) {
    return maskFn(value);
  }
  
  return value;
}

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'hr_admin':
      return 'HR Administrator';
    case 'manager':
      return 'Manager';
    case 'employee':
      return 'Employee (Self-Service)';
    default:
      return 'Unknown';
  }
}

export function getRoleBadgeVariant(role: UserRole): 'default' | 'secondary' | 'outline' {
  switch (role) {
    case 'hr_admin':
      return 'default';
    case 'manager':
      return 'secondary';
    case 'employee':
      return 'outline';
    default:
      return 'outline';
  }
}

