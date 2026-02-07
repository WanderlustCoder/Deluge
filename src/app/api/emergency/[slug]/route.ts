'use server';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getEmergencyBySlug,
  updateEmergencyCampaign,
  addEmergencyUpdate,
  contributeToEmergency,
  resolveEmergency,
  closeEmergency,
} from '@/lib/emergency';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const emergency = await getEmergencyBySlug(slug);

    if (!emergency) {
      return NextResponse.json({ error: 'Emergency not found' }, { status: 404 });
    }

    return NextResponse.json({ emergency });
  } catch (error) {
    console.error('Failed to fetch emergency:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emergency' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();

    const emergency = await getEmergencyBySlug(slug);
    if (!emergency) {
      return NextResponse.json({ error: 'Emergency not found' }, { status: 404 });
    }

    // Handle status changes
    if (body.action === 'resolve') {
      const updated = await resolveEmergency(emergency.id);
      return NextResponse.json({ emergency: updated });
    }

    if (body.action === 'close') {
      const updated = await closeEmergency(emergency.id);
      return NextResponse.json({ emergency: updated });
    }

    const updated = await updateEmergencyCampaign(emergency.id, {
      title: body.title,
      description: body.description,
      location: body.location,
      targetAmount: body.targetAmount,
      verifiedOrgs: body.verifiedOrgs,
      priority: body.priority,
      status: body.status,
    });

    return NextResponse.json({ emergency: updated });
  } catch (error) {
    console.error('Failed to update emergency:', error);
    return NextResponse.json(
      { error: 'Failed to update emergency' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();

    const emergency = await getEmergencyBySlug(slug);
    if (!emergency) {
      return NextResponse.json({ error: 'Emergency not found' }, { status: 404 });
    }

    // Handle contribution
    if (body.action === 'contribute') {
      if (!body.amount || body.amount < 0.25) {
        return NextResponse.json(
          { error: 'Minimum contribution is $0.25' },
          { status: 400 }
        );
      }

      const updated = await contributeToEmergency(
        emergency.id,
        session.user.id,
        body.amount
      );
      return NextResponse.json({ emergency: updated });
    }

    // Handle adding update (admin only)
    if (body.action === 'update') {
      if (session.user.accountType !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      if (!body.title || !body.content) {
        return NextResponse.json(
          { error: 'Title and content are required' },
          { status: 400 }
        );
      }

      const update = await addEmergencyUpdate(emergency.id, session.user.id, {
        title: body.title,
        content: body.content,
      });
      return NextResponse.json({ update });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to process emergency action:', error);
    const message = error instanceof Error ? error.message : 'Failed to process action';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
