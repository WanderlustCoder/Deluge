// Test webhook endpoint

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { dispatchWebhook, generateSignature } from '@/lib/api/webhook-dispatcher';

// POST - Send a test webhook
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const webhook = await prisma.webhook.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    // Send test payload
    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook from Deluge',
        webhookId: webhook.id,
        triggeredBy: session.user.email,
      },
    };

    const payloadString = JSON.stringify(testPayload);
    const signature = generateSignature(payloadString, webhook.secret);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const startTime = Date.now();
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Id': 'test',
        'X-Webhook-Timestamp': testPayload.timestamp,
        'User-Agent': 'Deluge-Webhook/1.0 (Test)',
      },
      body: payloadString,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const duration = Date.now() - startTime;
    const responseBody = await response.text().catch(() => '');

    return NextResponse.json({
      success: response.ok,
      statusCode: response.status,
      duration,
      responseBody: responseBody.substring(0, 500),
      payload: testPayload,
    });
  } catch (error) {
    console.error('Error testing webhook:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({
        success: false,
        error: 'Request timed out after 10 seconds',
      });
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send test webhook',
    });
  }
}
