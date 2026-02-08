/**
 * AI Predictions API
 * Plan 28: AI-Powered Platform Features
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  predictProjectSuccess,
  getStoredPrediction,
  storeProjectPrediction,
  updateAllPredictions,
} from '@/lib/ai/predictions';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const refresh = searchParams.get('refresh') === 'true';

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    // Check for cached prediction first
    if (!refresh) {
      const cached = await getStoredPrediction(projectId);
      if (cached) {
        return NextResponse.json({ prediction: cached, cached: true });
      }
    }

    // Generate new prediction
    const prediction = await predictProjectSuccess(projectId);

    // Store for future use
    await storeProjectPrediction(prediction);

    return NextResponse.json({ prediction, cached: false });
  } catch (error) {
    console.error('Error getting prediction:', error);
    return NextResponse.json(
      { error: 'Failed to get prediction' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'batch_update') {
      const updated = await updateAllPredictions();
      return NextResponse.json({ updated, message: `Updated ${updated} predictions` });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Error in predictions POST:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
