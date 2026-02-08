// GET /api/learn/resources - List learning resources

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPublishedResources, getResourceCategoryCounts, ResourceCategory, ResourceFormat } from '@/lib/learning/resources';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') as ResourceCategory | null;
  const format = searchParams.get('format') as ResourceFormat | null;
  const search = searchParams.get('search') || undefined;

  try {
    const [resources, categories] = await Promise.all([
      getPublishedResources({
        category: category || undefined,
        format: format || undefined,
        search,
      }),
      getResourceCategoryCounts(),
    ]);

    return NextResponse.json({
      resources,
      categories,
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}
