import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export type TwoFactorMethod = 'totp' | 'sms' | 'email';

// Generate a TOTP secret (simulated - in production use speakeasy or similar)
export function generateTOTPSecret(): string {
  return crypto.randomBytes(20).toString('base64');
}

// Generate backup codes
export function generateBackupCodes(count: number = 10): string[] {
  return Array.from({ length: count }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
}

// Hash backup codes for storage
function hashBackupCodes(codes: string[]): string[] {
  return codes.map((code) =>
    crypto.createHash('sha256').update(code).digest('hex')
  );
}

// Enable 2FA for a user
export async function enable2FA(
  userId: string,
  method: TwoFactorMethod,
  options?: { phone?: string }
) {
  const secret = method === 'totp' ? generateTOTPSecret() : null;
  const backupCodes = generateBackupCodes();
  const hashedCodes = hashBackupCodes(backupCodes);

  await prisma.twoFactorAuth.upsert({
    where: { userId },
    create: {
      userId,
      method,
      secret,
      phone: options?.phone,
      backupCodes: JSON.stringify(hashedCodes),
      isEnabled: false, // Must verify before enabled
    },
    update: {
      method,
      secret,
      phone: options?.phone,
      backupCodes: JSON.stringify(hashedCodes),
      isEnabled: false,
      verifiedAt: null,
    },
  });

  // Return the unhashed backup codes to show to user once
  return {
    secret,
    backupCodes,
    method,
  };
}

// Verify and activate 2FA
export async function verify2FA(userId: string, code: string) {
  const twoFA = await prisma.twoFactorAuth.findUnique({
    where: { userId },
  });

  if (!twoFA) {
    throw new Error('2FA not configured');
  }

  // Simulate TOTP verification
  // In production, use speakeasy.totp.verify
  const isValid = code.length === 6 && /^\d{6}$/.test(code);

  if (!isValid) {
    throw new Error('Invalid verification code');
  }

  await prisma.twoFactorAuth.update({
    where: { userId },
    data: {
      isEnabled: true,
      verifiedAt: new Date(),
    },
  });

  // Log security event
  await prisma.securityEvent.create({
    data: {
      userId,
      eventType: '2fa_enabled',
      severity: 'info',
      metadata: JSON.stringify({ method: twoFA.method }),
    },
  });

  return true;
}

// Validate 2FA code during login
export async function validate2FACode(userId: string, code: string): Promise<boolean> {
  const twoFA = await prisma.twoFactorAuth.findUnique({
    where: { userId },
  });

  if (!twoFA || !twoFA.isEnabled) {
    return true; // 2FA not enabled, skip
  }

  // Check if it's a backup code
  const hashedCode = crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');
  const storedCodes: string[] = JSON.parse(twoFA.backupCodes);

  if (storedCodes.includes(hashedCode)) {
    // Remove used backup code
    const newCodes = storedCodes.filter((c) => c !== hashedCode);
    await prisma.twoFactorAuth.update({
      where: { userId },
      data: { backupCodes: JSON.stringify(newCodes) },
    });
    return true;
  }

  // Validate TOTP code (simulated)
  // In production, use speakeasy.totp.verify with twoFA.secret
  const isValid = code.length === 6 && /^\d{6}$/.test(code);

  return isValid;
}

// Disable 2FA
export async function disable2FA(userId: string) {
  await prisma.twoFactorAuth.update({
    where: { userId },
    data: {
      isEnabled: false,
      verifiedAt: null,
    },
  });

  await prisma.securityEvent.create({
    data: {
      userId,
      eventType: '2fa_disabled',
      severity: 'warning',
    },
  });
}

// Check if user has 2FA enabled
export async function has2FAEnabled(userId: string): Promise<boolean> {
  const twoFA = await prisma.twoFactorAuth.findUnique({
    where: { userId },
  });

  return twoFA?.isEnabled ?? false;
}

// Get 2FA status
export async function get2FAStatus(userId: string) {
  const twoFA = await prisma.twoFactorAuth.findUnique({
    where: { userId },
  });

  if (!twoFA) {
    return { enabled: false, method: null, hasBackupCodes: false };
  }

  const codes: string[] = JSON.parse(twoFA.backupCodes);

  return {
    enabled: twoFA.isEnabled,
    method: twoFA.method,
    hasBackupCodes: codes.length > 0,
    backupCodesRemaining: codes.length,
    verifiedAt: twoFA.verifiedAt,
  };
}

// Regenerate backup codes
export async function regenerateBackupCodes(userId: string) {
  const twoFA = await prisma.twoFactorAuth.findUnique({
    where: { userId },
  });

  if (!twoFA || !twoFA.isEnabled) {
    throw new Error('2FA must be enabled');
  }

  const backupCodes = generateBackupCodes();
  const hashedCodes = hashBackupCodes(backupCodes);

  await prisma.twoFactorAuth.update({
    where: { userId },
    data: { backupCodes: JSON.stringify(hashedCodes) },
  });

  return backupCodes;
}
