// GET /api/institutions/[id] - Public institution info

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Check if id is a slug or cuid
    const institution = await prisma.institution.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
        status: 'active',
      },
      include: {
        settings: {
          select: {
            allowPublicProjects: true,
            enableLoans: true,
            enableCommunities: true,
            customCategories: true,
          },
        },
        pages: {
          where: { isPublished: true, showInNav: true },
          orderBy: { order: 'asc' },
          select: {
            slug: true,
            title: true,
          },
        },
      },
    });

    if (!institution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }

    // Return public-safe information only
    return NextResponse.json({
      id: institution.id,
      name: institution.name,
      slug: institution.slug,
      type: institution.type,
      description: institution.description,
      logoUrl: institution.logoUrl,
      primaryColor: institution.primaryColor,
      secondaryColor: institution.secondaryColor,
      settings: institution.settings ? {
        allowPublicProjects: institution.settings.allowPublicProjects,
        enableLoans: institution.settings.enableLoans,
        enableCommunities: institution.settings.enableCommunities,
        customCategories: JSON.parse(institution.settings.customCategories),
      } : null,
      pages: institution.pages,
    });
  } catch (error) {
    console.error('Error fetching institution:', error);
    return NextResponse.json({ error: 'Failed to fetch institution' }, { status: 500 });
  }
}
