// GET /api/learn/scenarios - List scenarios

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getScenarios, getScenarioCategoryCounts } from '@/lib/learning/scenarios';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;

  try {
    const [scenarios, categories] = await Promise.all([
      getScenarios({ category }),
      getScenarioCategoryCounts(),
    ]);

    return NextResponse.json({
      scenarios,
      categories,
    });
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json({ error: 'Failed to fetch scenarios' }, { status: 500 });
  }
}
