import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getChallenges } from "@/lib/challenges";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;

  const challenges = await getChallenges(status);

  // Add community names to entries
  const challengesWithDetails = await Promise.all(
    challenges.map(async (challenge) => {
      const communityIds = challenge.entries.map((e) => e.communityId);
      const communities = await prisma.community.findMany({
        where: { id: { in: communityIds } },
        select: { id: true, name: true },
      });
      const communityMap = new Map(communities.map((c) => [c.id, c]));

      return {
        ...challenge,
        entries: challenge.entries
          .map((entry) => ({
            ...entry,
            communityName: communityMap.get(entry.communityId)?.name || "Unknown",
          }))
          .sort((a, b) => b.currentValue - a.currentValue),
      };
    })
  );

  return NextResponse.json(challengesWithDetails);
}

// Only admins can create challenges
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is platform admin
  if (session.user.accountType !== "admin") {
    return NextResponse.json(
      { error: "Only platform admins can create challenges" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { title, description, startDate, endDate, category, metric } = body;

  if (!title || !description || !startDate || !endDate || !metric) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const validMetrics = ["funding_amount", "projects_funded"];
  if (!validMetrics.includes(metric)) {
    return NextResponse.json({ error: "Invalid metric" }, { status: 400 });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    return NextResponse.json(
      { error: "End date must be after start date" },
      { status: 400 }
    );
  }

  const challenge = await prisma.communityChallenge.create({
    data: {
      title,
      description,
      startDate: start,
      endDate: end,
      category: category || null,
      metric,
      status: start <= new Date() ? "active" : "draft",
      createdBy: session.user.id,
    },
  });

  return NextResponse.json(challenge);
}
