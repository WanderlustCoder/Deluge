// GET/POST /api/account/locale - Manage user locale preferences

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isValidLocale, SUPPORTED_LOCALES } from '@/lib/i18n/config';

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userLocale = await prisma.userLocale.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      locale: userLocale || {
        locale: 'en',
        timezone: null,
        dateFormat: null,
        numberFormat: null,
      },
      supportedLocales: SUPPORTED_LOCALES,
    });
  } catch (error) {
    console.error('Error fetching locale preferences:', error);
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
    const { locale = 'en', timezone, dateFormat, numberFormat } = body;

    // Validate locale
    if (!isValidLocale(locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    }

    const userLocale = await prisma.userLocale.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        locale,
        timezone,
        dateFormat,
        numberFormat,
      },
      update: {
        locale,
        timezone,
        dateFormat,
        numberFormat,
      },
    });

    // Set cookie for locale
    const response = NextResponse.json({ locale: userLocale });
    response.cookies.set('locale', locale, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60, // 1 year
    });

    return response;
  } catch (error) {
    console.error('Error saving locale preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}
