import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  enable2FA,
  verify2FA,
  disable2FA,
  get2FAStatus,
  regenerateBackupCodes,
  type TwoFactorMethod,
} from '@/lib/security/2fa';

// GET: Get 2FA status
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = await get2FAStatus(session.user.id);
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching 2FA status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}

// POST: Setup or verify 2FA
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, method, code, phone } = body as {
      action: 'setup' | 'verify' | 'regenerate';
      method?: TwoFactorMethod;
      code?: string;
      phone?: string;
    };

    switch (action) {
      case 'setup': {
        if (!method) {
          return NextResponse.json(
            { error: 'Method required' },
            { status: 400 }
          );
        }

        const validMethods: TwoFactorMethod[] = ['totp', 'sms', 'email'];
        if (!validMethods.includes(method)) {
          return NextResponse.json(
            { error: 'Invalid method' },
            { status: 400 }
          );
        }

        if (method === 'sms' && !phone) {
          return NextResponse.json(
            { error: 'Phone number required for SMS' },
            { status: 400 }
          );
        }

        const setup = await enable2FA(session.user.id, method, { phone });

        // For TOTP, generate QR code URL
        const qrUrl = method === 'totp' && setup.secret
          ? `otpauth://totp/Deluge:${session.user.email}?secret=${setup.secret}&issuer=Deluge`
          : null;

        return NextResponse.json({
          success: true,
          method: setup.method,
          backupCodes: setup.backupCodes,
          qrUrl,
          message: 'Please verify your setup by entering a code',
        });
      }

      case 'verify': {
        if (!code) {
          return NextResponse.json(
            { error: 'Verification code required' },
            { status: 400 }
          );
        }

        await verify2FA(session.user.id, code);

        return NextResponse.json({
          success: true,
          message: '2FA has been enabled on your account',
        });
      }

      case 'regenerate': {
        const newCodes = await regenerateBackupCodes(session.user.id);

        return NextResponse.json({
          success: true,
          backupCodes: newCodes,
          message: 'New backup codes generated. Save them securely.',
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error with 2FA action:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}

// DELETE: Disable 2FA
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await disable2FA(session.user.id);

    return NextResponse.json({
      success: true,
      message: '2FA has been disabled on your account',
    });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return NextResponse.json(
      { error: 'Failed to disable 2FA' },
      { status: 500 }
    );
  }
}
