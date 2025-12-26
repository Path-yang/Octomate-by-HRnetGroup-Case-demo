// Singapore-specific validations for Octomate HR System

/**
 * Validates Singapore NRIC/FIN format
 * Format: S/T (citizens born before/after 2000) or F/G (foreigners) + 7 digits + checksum letter
 */
export function validateNRIC(nric: string): { valid: boolean; message: string } {
  if (!nric) {
    return { valid: false, message: 'NRIC/FIN is required' };
  }

  const trimmed = nric.toUpperCase().trim();
  
  // Check basic format: First letter + 7 digits + last letter
  const nricRegex = /^[STFGM]\d{7}[A-Z]$/;
  if (!nricRegex.test(trimmed)) {
    return { 
      valid: false, 
      message: 'Invalid format. Must be S/T/F/G/M followed by 7 digits and a letter' 
    };
  }

  // Validate checksum for S/T (citizens) and F/G (foreigners)
  const firstChar = trimmed[0];
  const digits = trimmed.slice(1, 8).split('').map(Number);
  const lastChar = trimmed[8];

  // Weights for checksum calculation
  const weights = [2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  
  for (let i = 0; i < 7; i++) {
    sum += digits[i] * weights[i];
  }

  // Offset for different NRIC types
  if (firstChar === 'T' || firstChar === 'G') {
    sum += 4;
  } else if (firstChar === 'M') {
    sum += 3;
  }

  const remainder = sum % 11;
  
  let checksumChars: string[];
  if (firstChar === 'S' || firstChar === 'T') {
    checksumChars = ['J', 'Z', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
  } else if (firstChar === 'F' || firstChar === 'G') {
    checksumChars = ['X', 'W', 'U', 'T', 'R', 'Q', 'P', 'N', 'M', 'L', 'K'];
  } else if (firstChar === 'M') {
    checksumChars = ['X', 'W', 'U', 'T', 'R', 'Q', 'P', 'N', 'J', 'L', 'K'];
  } else {
    return { valid: false, message: 'Invalid NRIC/FIN prefix' };
  }

  const expectedChecksum = checksumChars[remainder];
  
  if (lastChar !== expectedChecksum) {
    return { valid: false, message: 'Invalid NRIC/FIN checksum' };
  }

  return { valid: true, message: '' };
}

/**
 * Masks NRIC for display based on role
 * Full: S1234567A
 * Masked: S****567A
 */
export function maskNRIC(nric: string, fullyMasked = false): string {
  if (!nric || nric.length < 9) return nric;
  
  if (fullyMasked) {
    return nric[0] + '****' + nric.slice(-3);
  }
  
  return nric[0] + '****' + nric.slice(-4);
}

/**
 * Validates Singapore phone number
 * Mobile: +65 8/9XXX XXXX
 * Landline: +65 6XXX XXXX
 */
export function validateSGPhone(phone: string, type: 'mobile' | 'landline' = 'mobile'): { valid: boolean; message: string } {
  if (!phone) {
    return { valid: true, message: '' }; // Phone is optional
  }

  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Check if it starts with +65 or just the 8 digits
  let digits: string;
  if (cleaned.startsWith('+65')) {
    digits = cleaned.slice(3);
  } else if (cleaned.startsWith('65')) {
    digits = cleaned.slice(2);
  } else {
    digits = cleaned;
  }

  if (digits.length !== 8) {
    return { valid: false, message: 'Phone number must be 8 digits' };
  }

  if (type === 'mobile') {
    if (!/^[89]\d{7}$/.test(digits)) {
      return { valid: false, message: 'Mobile number must start with 8 or 9' };
    }
  } else {
    if (!/^6\d{7}$/.test(digits)) {
      return { valid: false, message: 'Landline must start with 6' };
    }
  }

  return { valid: true, message: '' };
}

/**
 * Formats phone number to standard SG format
 */
export function formatSGPhone(phone: string): string {
  if (!phone) return '';
  
  const cleaned = phone.replace(/[\s-]/g, '');
  let digits: string;
  
  if (cleaned.startsWith('+65')) {
    digits = cleaned.slice(3);
  } else if (cleaned.startsWith('65')) {
    digits = cleaned.slice(2);
  } else {
    digits = cleaned;
  }

  if (digits.length === 8) {
    return `+65 ${digits.slice(0, 4)} ${digits.slice(4)}`;
  }
  
  return phone;
}

/**
 * Validates Singapore postal code (6 digits)
 */
export function validateSGPostalCode(postalCode: string): { valid: boolean; message: string } {
  if (!postalCode) {
    return { valid: true, message: '' }; // Postal code may be optional
  }

  const cleaned = postalCode.replace(/\s/g, '');
  
  if (!/^\d{6}$/.test(cleaned)) {
    return { valid: false, message: 'Postal code must be 6 digits' };
  }

  // Check if it's in a valid range (Singapore postal codes)
  const num = parseInt(cleaned, 10);
  if (num < 10000 || num > 829999) {
    return { valid: false, message: 'Invalid Singapore postal code range' };
  }

  return { valid: true, message: '' };
}

/**
 * Validates email format
 */
export function validateEmail(email: string, isRequired = false): { valid: boolean; message: string } {
  if (!email) {
    if (isRequired) {
      return { valid: false, message: 'Email is required' };
    }
    return { valid: true, message: '' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email format' };
  }

  return { valid: true, message: '' };
}

/**
 * Validates work email (must be company domain or valid format)
 */
export function validateWorkEmail(email: string): { valid: boolean; message: string } {
  const result = validateEmail(email, true);
  if (!result.valid) return result;

  // Additional check for work email
  const commonPersonalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (commonPersonalDomains.includes(domain)) {
    return { 
      valid: true, 
      message: 'Warning: Consider using a company email address' 
    };
  }

  return { valid: true, message: '' };
}

/**
 * Validates bank account number format
 */
export function validateBankAccount(accountNumber: string): { valid: boolean; message: string } {
  if (!accountNumber) {
    return { valid: false, message: 'Account number is required' };
  }

  // Singapore bank accounts are typically 10-14 digits
  const cleaned = accountNumber.replace(/[\s-]/g, '');
  
  if (!/^\d{10,14}$/.test(cleaned)) {
    return { valid: false, message: 'Account number must be 10-14 digits' };
  }

  return { valid: true, message: '' };
}

/**
 * Masks bank account number for display
 */
export function maskBankAccount(accountNumber: string): string {
  if (!accountNumber || accountNumber.length < 4) return accountNumber;
  
  return '****' + accountNumber.slice(-4);
}

/**
 * Validates SWIFT/BIC code format
 */
export function validateSwiftCode(code: string): { valid: boolean; message: string } {
  if (!code) {
    return { valid: false, message: 'SWIFT/BIC code is required' };
  }

  // SWIFT code is 8 or 11 characters
  const swiftRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
  
  if (!swiftRegex.test(code.toUpperCase())) {
    return { valid: false, message: 'Invalid SWIFT/BIC format (8 or 11 characters)' };
  }

  return { valid: true, message: '' };
}

/**
 * Calculates age from date of birth
 */
export function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Validates date of birth
 * - Cannot be future date
 * - Reasonable age range (16-100)
 */
export function validateDateOfBirth(dateOfBirth: string): { valid: boolean; message: string } {
  if (!dateOfBirth) {
    return { valid: false, message: 'Date of birth is required' };
  }

  const dob = new Date(dateOfBirth);
  const today = new Date();
  
  // Check if future date
  if (dob > today) {
    return { valid: false, message: 'Date of birth cannot be in the future' };
  }
  
  // Check age range (16-100)
  const age = calculateAge(dateOfBirth);
  if (age < 16) {
    return { valid: false, message: 'Employee must be at least 16 years old' };
  }
  if (age > 100) {
    return { valid: false, message: 'Please enter a valid date of birth' };
  }
  
  return { valid: true, message: '' };
}

/**
 * Calculates retirement year based on DOB and retirement age
 */
export function calculateRetirementYear(dateOfBirth: string, retirementAge: number = 63): number {
  const dob = new Date(dateOfBirth);
  return dob.getFullYear() + retirementAge;
}

/**
 * Calculates retirement date based on DOB and retirement age
 */
export function calculateRetirementDate(dateOfBirth: string, retirementAge: number = 63): string {
  const dob = new Date(dateOfBirth);
  const retirementDate = new Date(dob);
  retirementDate.setFullYear(dob.getFullYear() + retirementAge);
  return retirementDate.toISOString().split('T')[0];
}

/**
 * Generates employee ID in format: EMP-YYYY-XXXX
 */
export function generateEmployeeId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `EMP-${year}-${random}`;
}

/**
 * Validates required fields
 */
export function validateRequired(value: unknown, fieldName: string): { valid: boolean; message: string } {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true, message: '' };
}

