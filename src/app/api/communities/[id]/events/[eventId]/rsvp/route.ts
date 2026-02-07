import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const RSVP_STATUSES = ["attending", "maybe", "declined"] as const;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, eventId } = await params;

  // Verify user is a member of this community
  const membership = await prisma.communityMember.findUnique({
    where: {
      communityId_userId: { communityId: id, userId: session.user.id },
    },
  });

  if (!membership) {
    return NextResponse.json(
      { error: "Must be a community member to RSVP" },
      { status: 403 }
    );
  }

  // Verify event exists and belongs to this community
  const event = await prisma.communityEvent.findFirst({
    where: { id: eventId, communityId: id },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const body = await request.json();
  const { status } = body;

  if (!RSVP_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid RSVP status" }, { status: 400 });
  }

  // Upsert RSVP
  const rsvp = await prisma.eventRSVP.upsert({
    where: {
      eventId_userId: { eventId, userId: session.user.id },
    },
    update: { status },
    create: {
      eventId,
      userId: session.user.id,
      status,
    },
  });

  return NextResponse.json(rsvp);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;

  await prisma.eventRSVP.deleteMany({
    where: {
      eventId,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ success: true });
}
