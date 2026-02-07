import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug, id } = await params;

    // Find the corporate account
    const account = await prisma.corporateAccount.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Verify user is an employee
    const employee = await prisma.corporateEmployee.findUnique({
      where: { userId: session.user.id },
    });

    if (!employee || employee.corporateAccountId !== account.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Get the campaign
    const campaign = await prisma.corporateCampaign.findUnique({
      where: { id },
    });

    if (!campaign || campaign.corporateAccountId !== account.id) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Count participants - unique users who funded during campaign period
    const participants = await prisma.corporateMatchingRecord.findMany({
      where: {
        corporateAccountId: account.id,
        matchDate: {
          gte: campaign.startDate,
          lte: campaign.endDate,
        },
      },
      select: { userId: true },
      distinct: ['userId'],
    });

    // Get top projects funded during this campaign
    const projectFunding = await prisma.corporateMatchingRecord.groupBy({
      by: ['projectId'],
      where: {
        corporateAccountId: account.id,
        matchDate: {
          gte: campaign.startDate,
          lte: campaign.endDate,
        },
        projectId: { not: null },
      },
      _sum: {
        originalAmount: true,
        matchedAmount: true,
      },
      orderBy: {
        _sum: {
          originalAmount: 'desc',
        },
      },
      take: 5,
    });

    // Get project details
    const projectIds = projectFunding
      .map((p) => p.projectId)
      .filter((id): id is string => id !== null);

    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: { id: true, title: true },
    });

    const projectMap = new Map(projects.map((p) => [p.id, p]));

    const topProjects = projectFunding
      .filter((p) => p.projectId)
      .map((p) => ({
        id: p.projectId!,
        title: projectMap.get(p.projectId!)?.title || 'Unknown',
        amount: (p._sum?.originalAmount || 0) + (p._sum?.matchedAmount || 0),
      }));

    return NextResponse.json({
      campaign: {
        ...campaign,
        participantCount: participants.length,
        topProjects,
        projectIds: campaign.featuredProjects ? JSON.parse(campaign.featuredProjects) : [],
        communityIds: [],
        categories: campaign.categories ? JSON.parse(campaign.categories) : [],
      },
    });
  } catch (error) {
    console.error('Failed to get campaign:', error);
    return NextResponse.json(
      { error: 'Failed to get campaign' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug, id } = await params;
    const body = await request.json();

    // Find the corporate account
    const account = await prisma.corporateAccount.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Verify user is an admin employee
    const employee = await prisma.corporateEmployee.findUnique({
      where: { userId: session.user.id },
    });

    if (!employee || employee.corporateAccountId !== account.id || !employee.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Verify campaign belongs to this account
    const existing = await prisma.corporateCampaign.findUnique({
      where: { id },
    });

    if (!existing || existing.corporateAccountId !== account.id) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Update the campaign
    const campaign = await prisma.corporateCampaign.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        targetAmount: body.targetAmount,
        matchingBonus: body.matchingBonus,
        status: body.status,
        featuredProjects: body.projectIds ? JSON.stringify(body.projectIds) : undefined,
        categories: body.categories ? JSON.stringify(body.categories) : undefined,
      },
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Failed to update campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug, id } = await params;

    // Find the corporate account
    const account = await prisma.corporateAccount.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Verify user is an admin employee
    const employee = await prisma.corporateEmployee.findUnique({
      where: { userId: session.user.id },
    });

    if (!employee || employee.corporateAccountId !== account.id || !employee.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Verify campaign belongs to this account
    const existing = await prisma.corporateCampaign.findUnique({
      where: { id },
    });

    if (!existing || existing.corporateAccountId !== account.id) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Delete the campaign
    await prisma.corporateCampaign.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete campaign:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
