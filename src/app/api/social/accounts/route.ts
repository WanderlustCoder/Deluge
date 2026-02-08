import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserSocialAccounts, disconnectSocialAccount, SocialProvider } from '@/lib/social';

// GET: Get user's connected social accounts
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accounts = await getUserSocialAccounts(session.user.id);

    // Remove sensitive data before returning
    const safeAccounts = accounts.map((account) => ({
      id: account.id,
      provider: account.provider,
      email: account.email,
      name: account.name,
      profileUrl: account.profileUrl,
      avatarUrl: account.avatarUrl,
      isConnected: account.isConnected,
      connectedAt: account.connectedAt,
      lastSyncAt: account.lastSyncAt,
    }));

    return NextResponse.json(safeAccounts);
  } catch (error) {
    console.error('Error fetching social accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

// DELETE: Disconnect a social account
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') as SocialProvider;

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      );
    }

    await disconnectSocialAccount(session.user.id, provider);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting social account:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect account' },
      { status: 500 }
    );
  }
}
