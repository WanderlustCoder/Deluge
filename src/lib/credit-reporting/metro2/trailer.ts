// Metro 2 Trailer Record Generator

export interface TrailerData {
  totalBaseRecords: number;
  totalJ1Records: number;
  totalJ2Records: number;
  totalK1Records: number;
  totalK2Records: number;
  totalK3Records: number;
  totalK4Records: number;
  blocksCount: number;
}

// Pad number with leading zeros
function padNumber(num: number, length: number): string {
  return num.toString().padStart(length, '0').substring(0, length);
}

// Pad string with spaces
function padString(str: string | undefined, length: number): string {
  const s = (str || '').toUpperCase();
  if (s.length >= length) {
    return s.substring(0, length);
  }
  return s.padEnd(length, ' ');
}

// Generate trailer record
export function generateTrailer(data: TrailerData): string {
  const fields: string[] = [];

  // Record Descriptor Word (4 bytes)
  fields.push('0426');

  // Record Identifier (7 bytes)
  fields.push('TRAILER');

  // Reserved (1 byte)
  fields.push(' ');

  // Total Base Records (9 bytes)
  fields.push(padNumber(data.totalBaseRecords, 9));

  // Reserved (9 bytes)
  fields.push(padString('', 9));

  // Total J1 Segments (9 bytes)
  fields.push(padNumber(data.totalJ1Records, 9));

  // Total J2 Segments (9 bytes)
  fields.push(padNumber(data.totalJ2Records, 9));

  // Block Count (9 bytes)
  fields.push(padNumber(data.blocksCount, 9));

  // Total K1 Segments (9 bytes)
  fields.push(padNumber(data.totalK1Records, 9));

  // Total K2 Segments (9 bytes)
  fields.push(padNumber(data.totalK2Records, 9));

  // Total K3 Segments (9 bytes)
  fields.push(padNumber(data.totalK3Records, 9));

  // Total K4 Segments (9 bytes)
  fields.push(padNumber(data.totalK4Records, 9));

  // Reserved (fill to 426 bytes)
  const currentLength = fields.join('').length;
  const remainingLength = 426 - currentLength;
  fields.push(padString('', remainingLength));

  return fields.join('');
}

// Calculate block count (records / records per block, rounded up)
export function calculateBlockCount(totalRecords: number, recordsPerBlock: number = 10): number {
  return Math.ceil(totalRecords / recordsPerBlock);
}
