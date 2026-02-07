import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const proposalSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(50).max(2000),
  fundingGoal: z.number().min(100).max(100000),
  deadline: z.string().transform((s) => new Date(s)),
  category: z.string().min(1),
  location: z.string().min(1),
  imageUrl: z.string().url().optional().nullable(),
  gallery: z.array(z.string().url()).optional(),
  orgName: z.string().min(2).max(100),
  orgType: z.enum(["nonprofit", "school", "community_org", "small_business", "individual"]),
  ein: z.string().optional().nullable(),
  fundsCover: z.string().min(20).max(500),
  successMetrics: z.string().min(20).max(500),
  reportingPlan: z.string().min(20).max(500),
});

// GET /api/proposals - List user's proposals
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const proposals = await prisma.projectProposal.findMany({
    where: { proposerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      project: {
        select: { id: true, title: true, status: true, fundingRaised: true, fundingGoal: true },
      },
    },
  });

  return NextResponse.json(proposals);
}

// POST /api/proposals - Create a new proposal
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = proposalSchema.parse(body);

    const proposal = await prisma.projectProposal.create({
      data: {
        proposerId: session.user.id,
        title: data.title,
        description: data.description,
        fundingGoal: data.fundingGoal,
        deadline: data.deadline,
        category: data.category,
        location: data.location,
        imageUrl: data.imageUrl,
        gallery: data.gallery ? JSON.stringify(data.gallery) : null,
        orgName: data.orgName,
        orgType: data.orgType,
        ein: data.ein,
        fundsCover: data.fundsCover,
        successMetrics: data.successMetrics,
        reportingPlan: data.reportingPlan,
        status: "draft",
      },
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
    }
    console.error("Error creating proposal:", error);
    return NextResponse.json({ error: "Failed to create proposal" }, { status: 500 });
  }
}
