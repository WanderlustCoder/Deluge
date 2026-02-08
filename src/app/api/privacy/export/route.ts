import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  createDataRequest,
  getUserDataRequests,
  collectUserData,
} from '@/lib/privacy/export';
import { auditDataExport } from '@/lib/security/audit';

// GET: Get user's data requests
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await getUserDataRequests(session.user.id);
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching data requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

// POST: Create data export request or get immediate export
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type = 'export', immediate = true } = body as {
      type?: 'access' | 'export' | 'portability';
      immediate?: boolean;
    };

    const ipAddress = request.headers.get('x-forwarded-for') || undefined;

    // Log the export request
    await auditDataExport(session.user.id, ipAddress);

    if (immediate && type === 'export') {
      // Return data immediately for small datasets
      const data = await collectUserData(session.user.id);

      // Create a completed request record
      await createDataRequest(session.user.id, type);

      return NextResponse.json({
        success: true,
        data,
        exportedAt: new Date().toISOString(),
      });
    }

    // Queue for async processing
    const dataRequest = await createDataRequest(session.user.id, type);

    return NextResponse.json({
      success: true,
      requestId: dataRequest.id,
      status: 'pending',
      message: 'Your data export request has been submitted. You will be notified when it is ready.',
    });
  } catch (error) {
    console.error('Error creating data request:', error);
    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    );
  }
}
