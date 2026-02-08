/**
 * AI Content Assistance API
 * Plan 28: AI-Powered Platform Features
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  analyzeDescription,
  analyzeGrantApplication,
  suggestTitles,
  checkCompleteness,
  logAssistance,
} from '@/lib/ai/content-assistant';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startTime = Date.now();
    const body = await request.json();
    const { type, content } = body;

    if (!type || !content) {
      return NextResponse.json(
        { error: 'type and content are required' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'description':
        result = {
          analysis: analyzeDescription(content.description || ''),
          suggestedTitles: content.description
            ? suggestTitles(content.description)
            : [],
          completeness: checkCompleteness(content),
        };
        break;

      case 'grant':
        result = {
          analysis: analyzeGrantApplication(
            content.projectDescription || '',
            content.budgetDescription || '',
            content.impactStatement || ''
          ),
        };
        break;

      case 'completeness':
        result = { completeness: checkCompleteness(content) };
        break;

      case 'titles':
        result = { titles: suggestTitles(content.description || '') };
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown assistance type' },
          { status: 400 }
        );
    }

    const latencyMs = Date.now() - startTime;
    const inputLength = JSON.stringify(content).length;
    const outputLength = JSON.stringify(result).length;

    // Log the assistance request
    await logAssistance(
      session.user.id,
      type,
      inputLength,
      outputLength,
      latencyMs
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in content assistance:', error);
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    );
  }
}
