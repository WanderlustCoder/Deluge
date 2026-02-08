// GET /api/learn/resources/[slug] - Get a single learning resource

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getResourceBySlug } from '@/lib/learning/resources';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const resource = await getResourceBySlug(slug);

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    if (!resource.isPublished) {
      return NextResponse.json({ error: 'Resource not available' }, { status: 404 });
    }

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json({ error: 'Failed to fetch resource' }, { status: 500 });
  }
}
