// GET/POST /api/account/accessibility - Manage accessibility preferences

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const preferences = await prisma.accessibilityPreferences.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      preferences: preferences || {
        fontSize: 'medium',
        fontFamily: 'default',
        lineSpacing: 'normal',
        highContrast: false,
        reducedMotion: false,
        screenReader: false,
      },
    });
  } catch (error) {
    console.error('Error fetching accessibility preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      fontSize = 'medium',
      fontFamily = 'default',
      lineSpacing = 'normal',
      highContrast = false,
      reducedMotion = false,
      screenReader = false,
    } = body;

    // Validate values
    const validFontSizes = ['small', 'medium', 'large', 'xl'];
    const validFontFamilies = ['default', 'dyslexic', 'mono'];
    const validLineSpacings = ['tight', 'normal', 'relaxed'];

    if (!validFontSizes.includes(fontSize)) {
      return NextResponse.json({ error: 'Invalid font size' }, { status: 400 });
    }
    if (!validFontFamilies.includes(fontFamily)) {
      return NextResponse.json({ error: 'Invalid font family' }, { status: 400 });
    }
    if (!validLineSpacings.includes(lineSpacing)) {
      return NextResponse.json({ error: 'Invalid line spacing' }, { status: 400 });
    }

    const preferences = await prisma.accessibilityPreferences.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        fontSize,
        fontFamily,
        lineSpacing,
        highContrast: Boolean(highContrast),
        reducedMotion: Boolean(reducedMotion),
        screenReader: Boolean(screenReader),
      },
      update: {
        fontSize,
        fontFamily,
        lineSpacing,
        highContrast: Boolean(highContrast),
        reducedMotion: Boolean(reducedMotion),
        screenReader: Boolean(screenReader),
      },
    });

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error saving accessibility preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}
