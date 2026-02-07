import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EVENT_TYPES = ["meetup", "volunteer", "celebration", "launch"] as const;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const events = await prisma.communityEvent.findMany({
    where: { communityId: id },
    orderBy: { date: "asc" },
    include: {
      rsvps: {
        select: {
          id: true,
          userId: true,
          status: true,
        },
      },
    },
  });

  // Add user's RSVP status and counts
  const eventsWithStatus = events.map((event) => {
    const userRsvp = event.rsvps.find((r) => r.userId === session.user.id);
    const attendingCount = event.rsvps.filter((r) => r.status === "attending").length;
    const maybeCount = event.rsvps.filter((r) => r.status === "maybe").length;

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      endDate: event.endDate,
      location: event.location,
      type: event.type,
      createdAt: event.createdAt,
      userRsvpStatus: userRsvp?.status || null,
      attendingCount,
      maybeCount,
      totalRsvps: event.rsvps.length,
    };
  });

  return NextResponse.json(eventsWithStatus);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Check if user is admin of this community
  const membership = await prisma.communityMember.findUnique({
    where: {
      communityId_userId: { communityId: id, userId: session.user.id },
    },
  });

  if (!membership || membership.role !== "admin") {
    return NextResponse.json(
      { error: "Only community admins can create events" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { title, description, date, endDate, location, type } = body;

  // Validation
  if (!title || !description || !date || !type) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  if (!EVENT_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }

  const eventDate = new Date(date);
  if (eventDate <= new Date()) {
    return NextResponse.json(
      { error: "Event date must be in the future" },
      { status: 400 }
    );
  }

  const event = await prisma.communityEvent.create({
    data: {
      communityId: id,
      title,
      description,
      date: eventDate,
      endDate: endDate ? new Date(endDate) : null,
      location: location || null,
      type,
      createdBy: session.user.id,
    },
  });

  return NextResponse.json(event);
}
