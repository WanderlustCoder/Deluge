'use server';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getActiveEmergencies, createEmergencyCampaign } from '@/lib/emergency';

export async function GET() {
  try {
    const emergencies = await getActiveEmergencies();

    return NextResponse.json({ emergencies });
  } catch (error) {
    console.error('Failed to fetch emergencies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emergencies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.title || !body.slug || !body.description || !body.type) {
      return NextResponse.json(
        { error: 'Title, slug, description, and type are required' },
        { status: 400 }
      );
    }

    const emergency = await createEmergencyCampaign(session.user.id, {
      title: body.title,
      slug: body.slug,
      description: body.description,
      type: body.type,
      location: body.location,
      affectedArea: body.affectedArea,
      targetAmount: body.targetAmount,
      verifiedOrgs: body.verifiedOrgs,
      priority: body.priority,
    });

    return NextResponse.json({ emergency }, { status: 201 });
  } catch (error) {
    console.error('Failed to create emergency:', error);
    return NextResponse.json(
      { error: 'Failed to create emergency' },
      { status: 500 }
    );
  }
}
