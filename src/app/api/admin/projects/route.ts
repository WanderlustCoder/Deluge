import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { createProjectSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);

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

    logAudit({
      adminId: session.user.id,
      adminEmail: session.user.email!,
      action: "project_create",
      targetType: "project",
      targetId: project.id,
      details: JSON.stringify({ title: project.title }),
    });

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    logError("api/admin/projects", error, { route: "POST /api/admin/projects" });
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
