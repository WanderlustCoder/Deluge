// GET/POST /api/learn/reflections - Manage reflections

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getUserReflections,
  getRandomPrompt,
  createReflection,
  REFLECTION_PROMPTS,
} from '@/lib/learning/reflections';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const includePrompt = searchParams.get('includePrompt') === 'true';

  try {
    const [reflections, prompt] = await Promise.all([
      getUserReflections(session.user.id),
      includePrompt ? getRandomPrompt(session.user.id) : null,
    ]);

    return NextResponse.json({
      reflections,
      prompt,
      prompts: REFLECTION_PROMPTS, // All prompts for browsing
    });
  } catch (error) {
    console.error('Error fetching reflections:', error);
    return NextResponse.json({ error: 'Failed to fetch reflections' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { prompt, response, isPrivate } = body;

    if (!prompt || !response) {
      return NextResponse.json({ error: 'Prompt and response required' }, { status: 400 });
    }

    const reflection = await createReflection(session.user.id, {
      prompt,
      response,
      isPrivate: isPrivate ?? true,
    });

    return NextResponse.json(reflection);
  } catch (error) {
    console.error('Error creating reflection:', error);
    return NextResponse.json({ error: 'Failed to create reflection' }, { status: 500 });
  }
}
