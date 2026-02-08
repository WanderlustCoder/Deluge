import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getOrganizationBySlug,
  checkMemberPermission,
  inviteMember,
  removeMember,
  updateMemberRole,
} from '@/lib/organizations';
import { prisma } from '@/lib/prisma';

// GET /api/organizations/[slug]/members - Get organization members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const organization = await getOrganizationBySlug(slug);

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check if user is a member
    const hasPermission = await checkMemberPermission(
      organization.id,
      session.user.id,
      'viewer'
    );

    if (!hasPermission && session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const members = await prisma.organizationMember.findMany({
      where: { organizationId: organization.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

// POST /api/organizations/[slug]/members - Invite a member
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const organization = await getOrganizationBySlug(slug);

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check permission (admin role required)
    const hasPermission = await checkMemberPermission(
      organization.id,
      session.user.id,
      'admin'
    );

    if (!hasPermission && session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (role && !['owner', 'admin', 'member', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already a member
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: { organizationId: organization.id, userId },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member' },
        { status: 400 }
      );
    }

    const member = await inviteMember(
      organization.id,
      userId,
      role || 'member',
      session.user.id
    );

    return NextResponse.json({
      success: true,
      member,
      message: 'Member invited successfully',
    });
  } catch (error) {
    console.error('Error inviting member:', error);
    return NextResponse.json(
      { error: 'Failed to invite member' },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[slug]/members - Remove a member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const organization = await getOrganizationBySlug(slug);

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check permission (admin role required, or self-removal)
    const isSelfRemoval = userId === session.user.id;
    const hasPermission = await checkMemberPermission(
      organization.id,
      session.user.id,
      'admin'
    );

    if (!isSelfRemoval && !hasPermission && session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Check if target is owner
    const targetMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: { organizationId: organization.id, userId },
      },
    });

    if (targetMember?.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot remove organization owner' },
        { status: 400 }
      );
    }

    await removeMember(organization.id, userId);

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}

// PATCH /api/organizations/[slug]/members - Update member role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const organization = await getOrganizationBySlug(slug);

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check permission (owner only can change roles)
    const hasPermission = await checkMemberPermission(
      organization.id,
      session.user.id,
      'owner'
    );

    if (!hasPermission && session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      );
    }

    if (!['admin', 'member', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const member = await updateMemberRole(organization.id, userId, role);

    return NextResponse.json({
      success: true,
      member,
      message: 'Member role updated successfully',
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    return NextResponse.json(
      { error: 'Failed to update member role' },
      { status: 500 }
    );
  }
}
