// GET /api/impact - Get platform impact metrics

import { NextResponse } from 'next/server';
import { getPlatformImpact, refreshAllMetrics } from '@/lib/stories/impact-counter';

export async function GET() {
  try {
    const impact = await getPlatformImpact();

    // If no metrics, refresh them
    if (Object.keys(impact).length === 0) {
      const freshImpact = await refreshAllMetrics();
      return NextResponse.json({ impact: freshImpact });
    }

    return NextResponse.json({ impact });
  } catch (error) {
    console.error('Error fetching impact:', error);
    return NextResponse.json({ error: 'Failed to fetch impact' }, { status: 500 });
  }
}
