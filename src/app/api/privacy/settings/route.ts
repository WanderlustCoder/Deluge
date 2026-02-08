import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getPrivacySettings,
  updatePrivacySettings,
  type PrivacySettingsData,
} from '@/lib/privacy/settings';

// GET: Get user's privacy settings
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getPrivacySettings(session.user.id);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT: Update privacy settings
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as Partial<PrivacySettingsData>;

    // Validate values
    const validVisibility = ['public', 'community', 'private'];
    const validMessages = ['anyone', 'followers', 'none'];
    const validRetention = ['1y', '3y', '5y', 'indefinite'];

    if (body.profileVisibility && !validVisibility.includes(body.profileVisibility)) {
      return NextResponse.json(
        { error: 'Invalid profile visibility' },
        { status: 400 }
      );
    }

    if (body.allowMessages && !validMessages.includes(body.allowMessages)) {
      return NextResponse.json(
        { error: 'Invalid message permission' },
        { status: 400 }
      );
    }

    if (body.dataRetention && !validRetention.includes(body.dataRetention)) {
      return NextResponse.json(
        { error: 'Invalid data retention value' },
        { status: 400 }
      );
    }

    const updated = await updatePrivacySettings(session.user.id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
