import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Get user's registered devices
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const devices = await prisma.notificationChannel.findMany({
      where: { userId: session.user.id, isActive: true },
      orderBy: { lastUsedAt: 'desc' },
    });
    return NextResponse.json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}

// POST: Register a new device
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token, name } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Device token is required' },
        { status: 400 }
      );
    }

    const device = await prisma.notificationChannel.upsert({
      where: {
        userId_channel_identifier: {
          userId: session.user.id,
          channel: 'push',
          identifier: token,
        },
      },
      create: {
        userId: session.user.id,
        channel: 'push',
        identifier: token,
        name,
        isVerified: true,
        isActive: true,
      },
      update: {
        name,
        isActive: true,
        lastUsedAt: new Date(),
      },
    });
    return NextResponse.json(device);
  } catch (error) {
    console.error('Error registering device:', error);
    return NextResponse.json(
      { error: 'Failed to register device' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a device
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get('identifier');

    if (!identifier) {
      return NextResponse.json(
        { error: 'Device identifier is required' },
        { status: 400 }
      );
    }

    await prisma.notificationChannel.updateMany({
      where: { userId: session.user.id, identifier },
      data: { isActive: false },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing device:', error);
    return NextResponse.json(
      { error: 'Failed to remove device' },
      { status: 500 }
    );
  }
}
