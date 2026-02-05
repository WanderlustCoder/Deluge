import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { updateNameSchema } from "@/lib/validation";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateNameSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: parsed.data.name },
    });

    return NextResponse.json({
      success: true,
      data: { name: user.name },
    });
  } catch (error) {
    logError("api/account", error, { userId: session.user.id, route: "PATCH /api/account" });
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
