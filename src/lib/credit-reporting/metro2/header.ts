// Metro 2 Header Record Generator

export interface HeaderData {
  furnisherId: string;
  furnisherName: string;
  activityDate: Date;
  creationDate: Date;
  reporterAddress?: string;
  reporterCity?: string;
  reporterState?: string;
  reporterZip?: string;
  reporterPhone?: string;
  programId?: string;
}

// Pad or truncate string to exact length
function padString(str: string | undefined, length: number, padChar: string = ' '): string {
  const s = (str || '').toUpperCase();
  if (s.length >= length) {
    return s.substring(0, length);
  }
  return s.padEnd(length, padChar);
}

// Format date as MMDDYYYY
function formatDate(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  return `${month}${day}${year}`;
}

// Generate header record
export function generateHeader(data: HeaderData): string {
  const fields: string[] = [];

  // Record Descriptor Word (4 bytes) - record length
  fields.push('0426');

  // Record Identifier (6 bytes)
  fields.push('HEADER');

  // Cycle Identifier (2 bytes) - month
  const month = data.activityDate.getMonth() + 1;
  fields.push(month.toString().padStart(2, '0'));

  // Innovis Identification Number (10 bytes)
  fields.push(padString('', 10));

  // Equifax Identification Number (10 bytes)
  fields.push(padString(data.furnisherId, 10));

  // Experian Identification Number (5 bytes)
  fields.push(padString(data.furnisherId.substring(0, 5), 5));

  // TransUnion Identification Number (9 bytes)
  fields.push(padString(data.furnisherId.substring(0, 9), 9));

  // Activity Date (8 bytes)
  fields.push(formatDate(data.activityDate));

  // Date Created (8 bytes)
  fields.push(formatDate(data.creationDate));

  // Program Date (8 bytes) - same as activity date
  fields.push(formatDate(data.activityDate));

  // Program Revision Date (8 bytes)
  fields.push(formatDate(data.creationDate));

  // Reporter Name (40 bytes)
  fields.push(padString(data.furnisherName, 40));

  // Reporter Address (96 bytes)
  fields.push(padString(data.reporterAddress, 96));

  // Reporter Telephone Number (10 bytes)
  fields.push(padString(data.reporterPhone?.replace(/\D/g, ''), 10));

  // Software Vendor Name (40 bytes)
  fields.push(padString('DELUGE CREDIT REPORTING', 40));

  // Software Version Number (5 bytes)
  fields.push(padString('1.0.0', 5));

  // MIC Prcs Control Field (5 bytes) - Reserved for Experian
  fields.push(padString('', 5));

  // MIC Character Set Code (1 byte) - Reserved for Experian
  fields.push(' ');

  // Reserved (156 bytes)
  fields.push(padString('', 156));

  return fields.join('');
}

// Validate header data
export function validateHeaderData(data: HeaderData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.furnisherId) errors.push('Furnisher ID is required');
  if (!data.furnisherName) errors.push('Furnisher name is required');
  if (!data.activityDate) errors.push('Activity date is required');
  if (!data.creationDate) errors.push('Creation date is required');

  return {
    valid: errors.length === 0,
    errors,
  };
}
