// Metro 2 Base Segment Generator
// The base segment contains the primary account information

import {
  FIELD_LENGTHS,
  ACCOUNT_TYPE,
  PORTFOLIO_TYPE,
  TERMS_DURATION,
  INTEREST_TYPE,
} from './constants';

export interface BaseSegmentData {
  furnisherId: string;
  accountNumber: string;
  consumerFirstName: string;
  consumerLastName: string;
  consumerMiddleName?: string;
  socialSecurityNumber?: string;
  dateOfBirth?: Date;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  dateOpened: Date;
  creditLimit: number;
  highestCredit: number;
  termsMonths: number;
  scheduledPayment: number;
  actualPayment: number;
  accountStatus: string;
  paymentHistory: string;
  currentBalance: number;
  amountPastDue: number;
  dateOfInformation: Date;
  dateLastPayment?: Date;
  dateFirstDelinquency?: Date;
  dateClosed?: Date;
}

// Pad or truncate string to exact length
function padString(str: string | undefined, length: number, padChar: string = ' '): string {
  const s = (str || '').toUpperCase();
  if (s.length >= length) {
    return s.substring(0, length);
  }
  return s.padEnd(length, padChar);
}

// Format number with leading zeros
function padNumber(num: number | undefined, length: number): string {
  const n = Math.abs(Math.round(num || 0));
  return n.toString().padStart(length, '0').substring(0, length);
}

// Format date as MMDDYYYY
function formatDate(date: Date | undefined): string {
  if (!date) return '00000000';
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  return `${month}${day}${year}`;
}

// Format amount (in cents for Metro 2)
function formatAmount(amount: number): string {
  const cents = Math.round(amount * 100);
  return padNumber(cents / 100, FIELD_LENGTHS.CURRENT_BALANCE);
}

// Generate base segment record
export function generateBaseSegment(data: BaseSegmentData): string {
  const fields: string[] = [];

  // Record Descriptor Word (4 bytes) - record length
  fields.push('0426'); // Fixed length for base segment

  // Processing Indicator (1 byte)
  fields.push('1'); // 1 = Create/Update record

  // Time Stamp (14 bytes) - MMDDYYYYHHMMSS
  const now = new Date();
  const timestamp = formatDate(now) +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0');
  fields.push(timestamp);

  // Correction Indicator (1 byte)
  fields.push(' '); // Space = not a correction

  // Identification Number (20 bytes) - Furnisher's ID
  fields.push(padString(data.furnisherId, 20));

  // Cycle Identifier (2 bytes)
  fields.push(padString(now.getMonth().toString().padStart(2, '0'), 2));

  // Consumer Account Number (30 bytes)
  fields.push(padString(data.accountNumber, 30));

  // Portfolio Type (1 byte)
  fields.push(PORTFOLIO_TYPE.INSTALLMENT);

  // Account Type (2 bytes)
  fields.push(ACCOUNT_TYPE.INSTALLMENT);

  // Date Opened (8 bytes)
  fields.push(formatDate(data.dateOpened));

  // Credit Limit (9 bytes)
  fields.push(formatAmount(data.creditLimit));

  // Highest Credit (9 bytes)
  fields.push(formatAmount(data.highestCredit));

  // Terms Duration (3 bytes)
  fields.push(padNumber(data.termsMonths, 3));

  // Terms Frequency (1 byte)
  fields.push(TERMS_DURATION.MONTHLY);

  // Scheduled Monthly Payment Amount (9 bytes)
  fields.push(formatAmount(data.scheduledPayment));

  // Actual Payment Amount (9 bytes)
  fields.push(formatAmount(data.actualPayment));

  // Account Status (2 bytes)
  fields.push(padString(data.accountStatus, 2));

  // Payment Rating (1 byte) - Current month
  fields.push(data.paymentHistory[0] || '0');

  // Payment History Profile (24 bytes)
  fields.push(padString(data.paymentHistory, 24));

  // Special Comment (2 bytes)
  fields.push('  ');

  // Compliance Condition Code (2 bytes)
  fields.push('  ');

  // Current Balance (9 bytes)
  fields.push(formatAmount(data.currentBalance));

  // Amount Past Due (9 bytes)
  fields.push(formatAmount(data.amountPastDue));

  // Original Charge-off Amount (9 bytes)
  fields.push(padNumber(0, 9));

  // Date of Account Information (8 bytes)
  fields.push(formatDate(data.dateOfInformation));

  // First Delinquency Date (8 bytes)
  fields.push(formatDate(data.dateFirstDelinquency));

  // Date Closed (8 bytes)
  fields.push(formatDate(data.dateClosed));

  // Date of Last Payment (8 bytes)
  fields.push(formatDate(data.dateLastPayment));

  // Interest Type Indicator (1 byte)
  fields.push(INTEREST_TYPE.FIXED);

  // Reserved (2 bytes)
  fields.push('  ');

  // Consumer Information Indicators (2 bytes)
  fields.push('  ');

  // Consumer Segment (required fields)
  // Surname (25 bytes)
  fields.push(padString(data.consumerLastName, 25));

  // First Name (20 bytes)
  fields.push(padString(data.consumerFirstName, 20));

  // Middle Name (20 bytes)
  fields.push(padString(data.consumerMiddleName, 20));

  // Generation Code (1 byte)
  fields.push(' ');

  // Social Security Number (9 bytes)
  fields.push(padString(data.socialSecurityNumber?.replace(/-/g, ''), 9));

  // Date of Birth (8 bytes)
  fields.push(formatDate(data.dateOfBirth));

  // Telephone Number (10 bytes)
  fields.push(padString('', 10));

  // ECOA Code (1 byte) - Individual account
  fields.push('1');

  // Consumer Information Indicator (2 bytes)
  fields.push('  ');

  // Country Code (2 bytes)
  fields.push('US');

  // Address (32 bytes)
  fields.push(padString(data.address, 32));

  // City (20 bytes)
  fields.push(padString(data.city, 20));

  // State (2 bytes)
  fields.push(padString(data.state, 2));

  // Zip Code (9 bytes)
  fields.push(padString(data.zipCode?.replace(/-/g, ''), 9));

  // Address Indicator (1 byte)
  fields.push('C'); // C = Confirmed

  // Residence Code (1 byte)
  fields.push('O'); // O = Owns

  return fields.join('');
}

// Validate base segment data
export function validateBaseSegmentData(data: BaseSegmentData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.furnisherId) errors.push('Furnisher ID is required');
  if (!data.accountNumber) errors.push('Account number is required');
  if (!data.consumerFirstName) errors.push('Consumer first name is required');
  if (!data.consumerLastName) errors.push('Consumer last name is required');
  if (!data.dateOpened) errors.push('Date opened is required');
  if (!data.accountStatus || data.accountStatus.length !== 2) {
    errors.push('Valid 2-character account status is required');
  }
  if (!data.paymentHistory || data.paymentHistory.length !== 24) {
    errors.push('24-character payment history is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
