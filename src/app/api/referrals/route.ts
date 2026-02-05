import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// GET: my referrals
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const referrals = await prisma.referral.findMany({
    where: { referrerId: session.user.id },
    include: {
      referred: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(referrals);
}

// POST: generate a referral code
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Generate a unique code
  let code = generateCode();
  let exists = await prisma.referral.findUnique({ where: { code } });
  while (exists) {
    code = generateCode();
    exists = await prisma.referral.findUnique({ where: { code } });
  }

  const referral = await prisma.referral.create({
    data: {
      referrerId: session.user.id,
      code,
    },
  });

  return NextResponse.json({
    success: true,
    data: { code: referral.code },
  });
}
