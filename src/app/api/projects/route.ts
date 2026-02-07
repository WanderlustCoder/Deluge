import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (category) where.category = category;

  const projects = await prisma.project.findMany({
    where,
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      fundingGoal: true,
      fundingRaised: true,
      status: true,
      imageUrl: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ projects });
}
