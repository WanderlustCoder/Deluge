import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { updateProjectSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const project = await prisma.project.update({
      where: { id },
      data: parsed.data,
    });

    logAudit({
      adminId: session.user.id,
      adminEmail: session.user.email!,
      action: "project_edit",
      targetType: "project",
      targetId: id,
      details: JSON.stringify({ title: project.title, fields: Object.keys(parsed.data) }),
    });

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    logError("api/admin/projects/[id]", error, { route: `ADMIN /api/admin/projects/${id}` });
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      select: { title: true },
    });

    logAudit({
      adminId: session.user.id,
      adminEmail: session.user.email!,
      action: "project_delete",
      targetType: "project",
      targetId: id,
      details: JSON.stringify({ title: project?.title ?? "unknown" }),
    });

    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError("api/admin/projects/[id]", error, { route: `ADMIN /api/admin/projects/${id}` });
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
