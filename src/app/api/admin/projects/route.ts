import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PROJECT_CATEGORIES } from "@/lib/constants";

const createSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(PROJECT_CATEGORIES as unknown as [string, ...string[]]),
  fundingGoal: z.number().positive("Funding goal must be positive"),
  location: z.string().min(1, "Location is required"),
  imageUrl: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        fundingGoal: parsed.data.fundingGoal,
        location: parsed.data.location,
        imageUrl: parsed.data.imageUrl ?? null,
      },
    });

    return NextResponse.json({ success: true, data: project });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
