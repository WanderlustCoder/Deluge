import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  createJourney,
  getUserJourneys,
  getPublicJourneys,
  joinJourney,
} from '@/lib/celebrations/journeys';

// GET: Get user's journeys or public journeys
export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const publicOnly = searchParams.get('public') === 'true';

    if (publicOnly) {
      const journeys = await getPublicJourneys();
      return NextResponse.json(journeys);
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const journeys = await getUserJourneys(session.user.id);
    return NextResponse.json(journeys);
  } catch (error) {
    console.error('Error fetching journeys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journeys' },
      { status: 500 }
    );
  }
}

// POST: Create a new journey or join an existing one
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, journeyId, ...data } = body;

    if (action === 'join') {
      if (!journeyId) {
        return NextResponse.json(
          { error: 'Journey ID required' },
          { status: 400 }
        );
      }
      const member = await joinJourney(journeyId, session.user.id);
      return NextResponse.json(member);
    }

    // Create new journey
    const { name, description, purpose } = data;
    if (!name || !description || !purpose) {
      return NextResponse.json(
        { error: 'Name, description, and purpose are required' },
        { status: 400 }
      );
    }

    const journey = await createJourney(session.user.id, data);
    return NextResponse.json(journey);
  } catch (error) {
    console.error('Error with journey action:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}
