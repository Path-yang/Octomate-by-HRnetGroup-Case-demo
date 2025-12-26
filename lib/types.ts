// Core Employee Types for Octomate HR System

export type CardType = 'NRIC' | 'FIN' | 'Passport' | 'Work Permit';
export type Gender = 'Male' | 'Female' | 'Other';
export type Race = 'Chinese' | 'Malay' | 'Indian' | 'Eurasian' | 'Others';
export type Religion = 'Buddhism' | 'Christianity' | 'Islam' | 'Hinduism' | 'Taoism' | 'No Religion' | 'Others';
export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';
export type EmploymentStatus = 'Active' | 'Resigned' | 'Retired' | 'Terminated' | 'On Leave' | 'Probation';
export type Relationship = 'Spouse' | 'Parent' | 'Sibling' | 'Child' | 'Friend' | 'Other';
export type Qualification = 'PhD' | 'Masters' | 'Bachelors' | 'Diploma' | 'A-Level' | 'O-Level' | 'N-Level' | 'PSLE' | 'Others';

export type UserRole = 'hr_admin' | 'manager' | 'employee';

export interface Education {
  id: string;
  institution: string;
  qualification: Qualification;
  fieldOfStudy: string;
  yearObtained: number;
}

export interface WorkExperience {
  id: string;
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate?: string;
  description: string;
  isCurrent: boolean;
}

export interface EmergencyContact {
  name: string;
  mobileNumber: string;
  relationship: Relationship;
  homeOfficeNumber?: string;
}

export interface BankingInfo {
  namePerBankAccount: string;
  bankCountry: string;
  bankEntity: string;
  branchCode: string;
  accountNumber: string;
  bicSwiftCode: string;
}

export interface Address {
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
}

export interface OverseasAddress {
  addressLine: string;
  postalCode: string;
  country: string;
}

export interface Employee {
  id: string;
  // Core Identity
  fullName: string;
  alias?: string;
  nricFin: string;
  identityNo: string;
  cardType: CardType;
  nationality: string;
  dateOfBirth: string;
  gender: Gender;
  race: Race;
  religion: Religion;
  maritalStatus: MaritalStatus;
  photoUrl?: string;
  
  // Employment & Lifecycle
  workEmail: string;
  employeeId: string;
  department: string;
  jobTitle: string;
  employmentDate: string;
  retirementAge: number;
  retirementYear?: number;
  retirementDate?: string;
  reEmploymentDate?: string;
  employmentStatus: EmploymentStatus;
  
  // Contact Information
  contactNo?: string;
  homeNo?: string;
  personalEmail?: string;
  mailingAddress?: Address;
  overseasAddress?: OverseasAddress;
  
  // Banking & Payroll
  bankingInfo?: BankingInfo;
  
  // Qualifications & Experience
  highestQualification?: Qualification;
  educationHistory: Education[];
  workExperience: WorkExperience[];
  
  // Emergency Contacts
  emergencyContact1?: EmergencyContact;
  emergencyContact2?: EmergencyContact;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  pdpaConsent: boolean;
  pdpaConsentDate?: string;
}

export interface AuditLogEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'create' | 'update' | 'delete' | 'view' | 'export';
  field?: string;
  oldValue?: string;
  newValue?: string;
  description: string;
}

export interface FieldPermission {
  read: boolean;
  write: boolean;
  masked: boolean;
}

export interface TabPermissions {
  coreIdentity: {
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
  employment: {
    workEmail: FieldPermission;
    employeeId: FieldPermission;
    department: FieldPermission;
    jobTitle: FieldPermission;
    employmentDate: FieldPermission;
    retirementAge: FieldPermission;
    retirementYear: FieldPermission;
    retirementDate: FieldPermission;
    reEmploymentDate: FieldPermission;
    employmentStatus: FieldPermission;
  };
  contact: {
    contactNo: FieldPermission;
    homeNo: FieldPermission;
    personalEmail: FieldPermission;
    mailingAddress: FieldPermission;
    overseasAddress: FieldPermission;
  };
  banking: {
    visible: boolean;
    allFields: FieldPermission;
  };
  qualifications: {
    allFields: FieldPermission;
  };
  emergencyContacts: {
    allFields: FieldPermission;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId?: string; // For employee self-service
  avatar?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingUpdates: number;
  recentChanges: number;
  departmentBreakdown: Record<string, number>;
  statusBreakdown: Record<EmploymentStatus, number>;
}

export interface FilterOptions {
  department?: string;
  status?: EmploymentStatus;
  search?: string;
  sortBy?: 'name' | 'employeeId' | 'department' | 'status' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

