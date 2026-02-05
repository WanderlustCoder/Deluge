import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AD_CATEGORIES } from "@/lib/constants";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pref = await prisma.adPreference.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({
    blockedCategories: pref?.blockedCategories
      ? pref.blockedCategories.split(",").filter(Boolean)
      : [],
  });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { blockedCategories } = body;

  if (!Array.isArray(blockedCategories)) {
    return NextResponse.json(
      { error: "blockedCategories must be an array" },
      { status: 400 }
    );
  }

  // Validate all categories exist (except "General" which can't be blocked)
  const validCategories = AD_CATEGORIES.filter((c) => c !== "General");
  const filtered = blockedCategories.filter((c: string) =>
    validCategories.includes(c as typeof validCategories[number])
  );

  await prisma.adPreference.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      blockedCategories: filtered.join(","),
    },
    update: {
      blockedCategories: filtered.join(","),
    },
  });

  return NextResponse.json({ blockedCategories: filtered });
}
