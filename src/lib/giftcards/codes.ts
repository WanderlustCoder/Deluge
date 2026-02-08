import { prisma } from '@/lib/prisma';

// Character set for gift card codes (no confusing characters like 0/O, 1/I/L)
const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 16;
const CODE_SEGMENT_LENGTH = 4;

// Generate a random code segment
function generateSegment(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
  }
  return result;
}

// Generate a unique gift card code (format: XXXX-XXXX-XXXX-XXXX)
export async function generateGiftCardCode(): Promise<string> {
  let code: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    // Generate code in segments
    const segments: string[] = [];
    for (let i = 0; i < CODE_LENGTH / CODE_SEGMENT_LENGTH; i++) {
      segments.push(generateSegment(CODE_SEGMENT_LENGTH));
    }
    code = segments.join('-');

    // Check if code exists
    const existing = await prisma.giftCard.findUnique({
      where: { code },
      select: { id: true },
    });

    if (!existing) {
      isUnique = true;
    }

    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique gift card code');
  }

  return code!;
}

// Validate gift card code format
export function isValidCodeFormat(code: string): boolean {
  // Remove any spaces or dashes for validation
  const cleanCode = code.replace(/[\s-]/g, '').toUpperCase();

  if (cleanCode.length !== CODE_LENGTH) {
    return false;
  }

  // Check all characters are in charset
  for (const char of cleanCode) {
    if (!CHARSET.includes(char)) {
      return false;
    }
  }

  return true;
}

// Normalize code format (add dashes)
export function normalizeCode(code: string): string {
  const cleanCode = code.replace(/[\s-]/g, '').toUpperCase();

  if (cleanCode.length !== CODE_LENGTH) {
    return code;
  }

  const segments: string[] = [];
  for (let i = 0; i < cleanCode.length; i += CODE_SEGMENT_LENGTH) {
    segments.push(cleanCode.slice(i, i + CODE_SEGMENT_LENGTH));
  }

  return segments.join('-');
}

// Generate a batch of unique codes
export async function generateBatchCodes(count: number): Promise<string[]> {
  const codes: string[] = [];
  const existingCodes = new Set<string>();

  // Get all existing codes to avoid duplicates
  const existingCards = await prisma.giftCard.findMany({
    select: { code: true },
  });
  existingCards.forEach(card => existingCodes.add(card.code));

  let attempts = 0;
  const maxAttempts = count * 3;

  while (codes.length < count && attempts < maxAttempts) {
    const segments: string[] = [];
    for (let i = 0; i < CODE_LENGTH / CODE_SEGMENT_LENGTH; i++) {
      segments.push(generateSegment(CODE_SEGMENT_LENGTH));
    }
    const code = segments.join('-');

    if (!existingCodes.has(code) && !codes.includes(code)) {
      codes.push(code);
    }

    attempts++;
  }

  if (codes.length < count) {
    throw new Error(`Could only generate ${codes.length} unique codes out of ${count} requested`);
  }

  return codes;
}

// Mask code for display (show only last 4 characters)
export function maskCode(code: string): string {
  const cleanCode = code.replace(/[\s-]/g, '');
  if (cleanCode.length <= 4) {
    return '****';
  }
  return '****-****-****-' + cleanCode.slice(-4);
}
