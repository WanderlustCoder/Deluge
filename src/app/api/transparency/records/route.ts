/**
 * Transparency Records API
 * Plan 27: Blockchain Transparency Ledger
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getEntityRecords,
  getTransparencyStats,
  type EntityType,
} from '@/lib/blockchain/records';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType') as EntityType | null;
    const entityId = searchParams.get('entityId');
    const statsOnly = searchParams.get('stats') === 'true';

    // Stats endpoint (public)
    if (statsOnly) {
      const stats = await getTransparencyStats();
      return NextResponse.json({ stats });
    }

    // Entity records require auth
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'entityType and entityId are required' },
        { status: 400 }
      );
    }

    const records = await getEntityRecords(entityType, entityId);

    return NextResponse.json({ records });
  } catch (error) {
    console.error('Error fetching transparency records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    );
  }
}
