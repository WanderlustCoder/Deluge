import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdvocate } from '@/lib/advocates';
import { listResources, getResourcesByCategory, ResourceCategory, ResourceType } from '@/lib/advocates/resources';

// GET - List resources (advocates only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userIsAdvocate = await isAdvocate(session.user.id);
    if (!userIsAdvocate && session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Advocates only' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as ResourceCategory | null;
    const type = searchParams.get('type') as ResourceType | null;
    const grouped = searchParams.get('grouped') === 'true';

    if (grouped) {
      const resources = await getResourcesByCategory();
      return NextResponse.json({ resources });
    }

    const resources = await listResources({
      category: category || undefined,
      type: type || undefined,
    });

    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Failed to list resources:', error);
    return NextResponse.json(
      { error: 'Failed to list resources' },
      { status: 500 }
    );
  }
}
