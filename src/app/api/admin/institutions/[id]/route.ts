// GET/PUT/DELETE /api/admin/institutions/[id] - Institution management

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getInstitutionWithDetails, updateInstitution } from '@/lib/institutions';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const institution = await getInstitutionWithDetails(id);

    if (!institution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }

    return NextResponse.json(institution);
  } catch (error) {
    console.error('Error fetching institution:', error);
    return NextResponse.json({ error: 'Failed to fetch institution' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const institution = await updateInstitution(id, body);

    return NextResponse.json(institution);
  } catch (error) {
    console.error('Error updating institution:', error);
    return NextResponse.json({ error: 'Failed to update institution' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    await prisma.institution.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting institution:', error);
    return NextResponse.json({ error: 'Failed to delete institution' }, { status: 500 });
  }
}
