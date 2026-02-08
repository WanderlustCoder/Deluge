import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  requestAccountDeletion,
  cancelDeletion,
  getPendingDeletionRequests,
} from '@/lib/privacy/deletion';
import { auditAccountDeletion } from '@/lib/security/audit';
import { prisma } from '@/lib/prisma';

// GET: Check deletion status
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pendingRequest = await prisma.dataRequest.findFirst({
      where: {
        userId: session.user.id,
        type: 'deletion',
        status: 'pending',
      },
    });

    return NextResponse.json({
      hasPendingDeletion: !!pendingRequest,
      request: pendingRequest,
    });
  } catch (error) {
    console.error('Error checking deletion status:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}

// POST: Request account deletion
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { confirmation } = body as { confirmation?: string };

    // Require explicit confirmation
    if (confirmation !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { error: 'Please type "DELETE MY ACCOUNT" to confirm' },
        { status: 400 }
      );
    }

    // Check for existing pending request
    const existingRequest = await prisma.dataRequest.findFirst({
      where: {
        userId: session.user.id,
        type: 'deletion',
        status: 'pending',
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending deletion request' },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get('x-forwarded-for') || undefined;

    // Log the request
    await auditAccountDeletion(session.user.id, ipAddress);

    // Create deletion request
    const deletionRequest = await requestAccountDeletion(session.user.id);

    return NextResponse.json({
      success: true,
      requestId: deletionRequest.id,
      message: 'Your account deletion request has been submitted. You have 30 days to cancel.',
      gracePeriodDays: 30,
    });
  } catch (error) {
    console.error('Error requesting deletion:', error);
    return NextResponse.json(
      { error: 'Failed to request deletion' },
      { status: 500 }
    );
  }
}

// DELETE: Cancel pending deletion
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID required' },
        { status: 400 }
      );
    }

    // Verify the request belongs to the user
    const deletionRequest = await prisma.dataRequest.findFirst({
      where: {
        id: requestId,
        userId: session.user.id,
        type: 'deletion',
        status: 'pending',
      },
    });

    if (!deletionRequest) {
      return NextResponse.json(
        { error: 'Deletion request not found or already processed' },
        { status: 404 }
      );
    }

    await cancelDeletion(requestId);

    return NextResponse.json({
      success: true,
      message: 'Your deletion request has been cancelled.',
    });
  } catch (error) {
    console.error('Error cancelling deletion:', error);
    return NextResponse.json(
      { error: 'Failed to cancel deletion' },
      { status: 500 }
    );
  }
}
