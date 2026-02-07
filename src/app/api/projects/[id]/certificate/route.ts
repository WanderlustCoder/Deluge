import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCompletionData, generateCertificateData } from "@/lib/project-completion";
import { logError } from "@/lib/logger";

// GET: Generate completion certificate data for a backer
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const completionData = await getCompletionData(session.user.id, id);

    if (!completionData) {
      return NextResponse.json(
        { error: "Certificate not available. Project must be completed and you must be a backer." },
        { status: 404 }
      );
    }

    const certificateData = generateCertificateData(user.name, completionData);

    return NextResponse.json({
      success: true,
      certificate: certificateData,
    });
  } catch (error) {
    logError("api/projects/certificate", error, {
      projectId: id,
      userId: session.user.id,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
