import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFlagshipProject, finalizeFlagshipVote } from "@/lib/aquifer";
import { logAudit } from "@/lib/audit";
import { z } from "zod";
import { logError } from "@/lib/logger";

const updateFlagshipSchema = z.object({
  status: z.enum(["active", "voting", "funded", "tabled", "rejected"]).optional(),
  fundingSource: z.enum(["reserve", "pool", "mixed"]).optional(),
});

// GET: Get flagship project detail for admin
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const flagship = await getFlagshipProject(id);

  if (!flagship) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(flagship);
}

// PATCH: Update flagship project
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Handle finalize vote action
    if (body.action === "finalize") {
      const result = await finalizeFlagshipVote(id);

      logAudit({
        adminId: session.user.id,
        adminEmail: session.user.email!,
        action: "finalize_flagship_vote",
        targetType: "flagship",
        targetId: id,
        details: JSON.stringify(result),
      });

      return NextResponse.json({ success: true, data: result });
    }

    const parsed = updateFlagshipSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const flagship = await prisma.flagshipProject.update({
      where: { id },
      data: parsed.data,
    });

    logAudit({
      adminId: session.user.id,
      adminEmail: session.user.email!,
      action: "update_flagship_project",
      targetType: "flagship",
      targetId: id,
      details: JSON.stringify(parsed.data),
    });

    return NextResponse.json({ success: true, data: flagship });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const { id } = await params;
    logError("api/aquifer/admin/[id]", error, { userId: session.user.id, flagshipId: id });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete flagship project
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const flagship = await prisma.flagshipProject.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!flagship) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete both the flagship record and the underlying project
    await prisma.$transaction([
      prisma.flagshipProject.delete({ where: { id } }),
      prisma.project.delete({ where: { id: flagship.projectId } }),
    ]);

    logAudit({
      adminId: session.user.id,
      adminEmail: session.user.email!,
      action: "delete_flagship_project",
      targetType: "flagship",
      targetId: id,
      details: JSON.stringify({ projectTitle: flagship.project.title }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { id } = await params;
    logError("api/aquifer/admin/[id]", error, { userId: session.user.id, flagshipId: id });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
