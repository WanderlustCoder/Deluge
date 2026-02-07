import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { castFlagshipVote, getVoteTally, getVoteEligibility } from "@/lib/aquifer";
import { z } from "zod";
import { logError } from "@/lib/logger";

const voteSchema = z.object({
  vote: z.enum(["approve", "reject", "table"]),
});

// POST: Cast or update vote on flagship project
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = voteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const voteRecord = await castFlagshipVote(id, session.user.id, parsed.data.vote);
    const tally = await getVoteTally(id);

    return NextResponse.json({
      success: true,
      data: voteRecord,
      voteTally: tally,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const { id } = await params;
    logError("api/aquifer/projects/vote", error, { userId: session.user.id, flagshipId: id });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Check vote eligibility
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const eligibility = await getVoteEligibility(session.user.id);
  return NextResponse.json(eligibility);
}
