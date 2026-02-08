// GET/POST /api/testimonials - List and create testimonials

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  listTestimonials,
  createTestimonial,
  getFeaturedTestimonials,
  TestimonialType,
} from '@/lib/stories/testimonials';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as TestimonialType | null;
  const entityId = searchParams.get('entityId') || undefined;
  const featured = searchParams.get('featured') === 'true';
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    if (featured) {
      const testimonials = await getFeaturedTestimonials(limit);
      return NextResponse.json({ testimonials });
    }

    const testimonials = await listTestimonials({
      type: type || undefined,
      entityId,
      featured,
      limit,
    });

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  try {
    const body = await request.json();
    const { content, authorName, authorTitle, rating, type, entityId } = body;

    if (!content || !authorName || !type) {
      return NextResponse.json(
        { error: 'Content, author name, and type are required' },
        { status: 400 }
      );
    }

    const testimonial = await createTestimonial({
      content,
      authorId: session?.user?.id,
      authorName,
      authorTitle,
      rating,
      type,
      entityId,
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}
