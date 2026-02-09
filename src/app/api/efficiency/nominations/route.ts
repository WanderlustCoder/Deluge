import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { EFFICIENCY_NOMINATION_VOTE_DURATION_DAYS } from "@/lib/constants";

// GET: List nominations (user's nominations or community nominations)
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get("communityId");

    const where = communityId
      ? { communityId }
      : { nominatorId: session.user.id };

    const nominations = await prisma.efficiencyNomination.findMany({
      where,
      include: {
        home: { select: { id: true, status: true, address: true, city: true, state: true } },
        nominator: { select: { id: true, name: true } },
        community: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ nominations });
  } catch (error) {
    logError("api/efficiency/nominations", error, { userId: session.user.id });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// POST: Nominate a home
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      nomineeAddress, nomineeCity, nomineeState, nomineeZipCode,
      nomineeReason, nomineeConsent, communityId,
    } = body;

    if (!nomineeAddress || !nomineeCity || !nomineeState || !nomineeZipCode) {
      return NextResponse.json({ error: "Full address is required." }, { status: 400 });
    }
    if (!nomineeReason || nomineeReason.length < 10) {
      return NextResponse.json({ error: "Please provide a reason for the nomination (at least 10 characters)." }, { status: 400 });
    }
    if (!nomineeConsent) {
      return NextResponse.json({ error: "Homeowner consent is required." }, { status: 400 });
    }

    // Verify community membership if community nomination
    if (communityId) {
      const membership = await prisma.communityMember.findFirst({
        where: { communityId, userId: session.user.id },
      });
      if (!membership) {
        return NextResponse.json({ error: "You must be a community member to nominate." }, { status: 403 });
      }
    }

    // Check for duplicate nomination
    const existing = await prisma.efficiencyNomination.findFirst({
      where: {
        nomineeAddress,
        nomineeZipCode,
        status: { notIn: ["rejected"] },
      },
    });
    if (existing) {
      return NextResponse.json({ error: "A nomination already exists for this address." }, { status: 400 });
    }

    const votingEndsAt = new Date();
    votingEndsAt.setDate(votingEndsAt.getDate() + EFFICIENCY_NOMINATION_VOTE_DURATION_DAYS);

    const nomination = await prisma.efficiencyNomination.create({
      data: {
        nominatorId: session.user.id,
        communityId: communityId || null,
        nomineeAddress,
        nomineeCity,
        nomineeState,
        nomineeZipCode,
        nomineeReason,
        nomineeConsent,
        status: communityId ? "voting" : "pending",
        votingEndsAt: communityId ? votingEndsAt : null,
      },
    });

    return NextResponse.json({
      success: true,
      nomination,
      message: communityId
        ? "Nomination submitted for community vote."
        : "Nomination submitted for review.",
    }, { status: 201 });
  } catch (error) {
    logError("api/efficiency/nominations", error, { userId: session.user.id });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
