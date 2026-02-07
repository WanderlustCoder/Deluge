import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createCorporateAccount, listCorporateAccounts } from '@/lib/corporate';

// GET /api/corporate - List corporate accounts (admin only)
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const tier = searchParams.get('tier') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const accounts = await listCorporateAccounts({ status, tier, limit, offset });

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Error listing corporate accounts:', error);
    return NextResponse.json(
      { error: 'Failed to list corporate accounts' },
      { status: 500 }
    );
  }
}

// POST /api/corporate - Create corporate account (admin only)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, adminEmail, tier, matchingBudget, matchingRatio, contractStart, contractEnd } = body;

    if (!name || !adminEmail) {
      return NextResponse.json(
        { error: 'Name and admin email are required' },
        { status: 400 }
      );
    }

    const account = await createCorporateAccount({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      adminEmail,
      tier,
      matchingBudget,
      matchingRatio,
      contractStart: contractStart ? new Date(contractStart) : undefined,
      contractEnd: contractEnd ? new Date(contractEnd) : undefined,
    });

    return NextResponse.json({ success: true, account });
  } catch (error) {
    console.error('Error creating corporate account:', error);
    const message = error instanceof Error ? error.message : 'Failed to create account';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
