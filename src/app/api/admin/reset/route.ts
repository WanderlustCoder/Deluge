import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { logAudit } from "@/lib/audit";
import { RESERVE_INITIAL_BALANCE } from "@/lib/constants";

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Log BEFORE reset since data gets wiped
  logAudit({
    adminId: session.user.id!,
    adminEmail: session.user.email!,
    action: "demo_reset",
    targetType: "system",
    details: JSON.stringify({ note: "Full demo data reset initiated" }),
  });

  // Small delay to allow audit log to persist
  await new Promise((r) => setTimeout(r, 100));

  const passwordHash = await hash("password123", 12);

  // Clear all data (including new settlement/reserve tables)
  await prisma.reserveTransaction.deleteMany();
  await prisma.platformReserve.deleteMany();
  await prisma.projectDisbursement.deleteMany();
  await prisma.revenueSettlement.deleteMany();
  await prisma.electionVote.deleteMany();
  await prisma.electionNomination.deleteMany();
  await prisma.communityElection.deleteMany();
  await prisma.loanSponsorship.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.watershedTransaction.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.adView.deleteMany();
  await prisma.contribution.deleteMany();
  await prisma.watershed.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Re-seed
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@deluge.fund",
      passwordHash,
      accountType: "admin",
      watershed: { create: { balance: 0, totalInflow: 0, totalOutflow: 0 } },
    },
  });

  await prisma.user.create({
    data: {
      name: "Angela Martinez",
      email: "angela@example.com",
      passwordHash,
      accountType: "user",
      watershed: { create: { balance: 12.5, totalInflow: 45.0, totalOutflow: 32.5 } },
    },
  });

  await prisma.user.create({
    data: {
      name: "DeAndre Johnson",
      email: "deandre@example.com",
      passwordHash,
      accountType: "user",
      watershed: { create: { balance: 3.2, totalInflow: 3.2, totalOutflow: 0 } },
    },
  });

  await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@deluge.fund",
      passwordHash,
      accountType: "user",
      watershed: { create: { balance: 0, totalInflow: 0, totalOutflow: 0 } },
    },
  });

  // Projects
  const projectData = [
    { title: "Montbello Fresh Food Market", description: "Bringing a community-owned fresh food market to the Montbello food desert.", category: "Community", fundingGoal: 15000, fundingRaised: 14250, backerCount: 187, status: "active", location: "Montbello, Denver CO" },
    { title: "Park Hill Youth Coding Lab", description: "Free after-school coding program for middle schoolers in Park Hill.", category: "Education", fundingGoal: 8000, fundingRaised: 5600, backerCount: 92, status: "active", location: "Park Hill, Denver CO" },
    { title: "Five Points Community Garden", description: "Transforming an abandoned lot into a thriving community garden.", category: "Environment", fundingGoal: 5000, fundingRaised: 2500, backerCount: 64, status: "active", location: "Five Points, Denver CO" },
    { title: "Westwood Mental Health Hub", description: "Bilingual mental health resource center for the Westwood community.", category: "Health", fundingGoal: 20000, fundingRaised: 5000, backerCount: 73, status: "active", location: "Westwood, Denver CO" },
    { title: "Globeville Street Art Trail", description: "Walking trail of 12 murals celebrating Globeville's immigrant heritage.", category: "Arts & Culture", fundingGoal: 12000, fundingRaised: 1200, backerCount: 31, status: "active", location: "Globeville, Denver CO" },
    { title: "Sun Valley Tech Access Program", description: "Providing refurbished laptops and free internet to 200 families.", category: "Technology", fundingGoal: 10000, fundingRaised: 7500, backerCount: 118, status: "active", location: "Sun Valley, Denver CO" },
    { title: "Elyria-Swansea Youth Sports League", description: "Year-round youth sports program for kids ages 8-16.", category: "Youth", fundingGoal: 9000, fundingRaised: 3600, backerCount: 55, status: "active", location: "Elyria-Swansea, Denver CO" },
    { title: "Cole Neighborhood Tiny Home Village", description: "Pilot tiny home village with 8 units for unhoused individuals.", category: "Housing", fundingGoal: 25000, fundingRaised: 25000, backerCount: 312, status: "funded", location: "Cole, Denver CO" },
  ];

  for (const p of projectData) {
    await prisma.project.create({ data: p });
  }

  // Seed PlatformReserve with initial balance
  const reserve = await prisma.platformReserve.create({
    data: {
      balance: RESERVE_INITIAL_BALANCE,
      totalInflow: RESERVE_INITIAL_BALANCE,
      totalOutflow: 0,
      totalReplenished: RESERVE_INITIAL_BALANCE,
    },
  });

  await prisma.reserveTransaction.create({
    data: {
      reserveId: reserve.id,
      type: "manual_adjustment",
      amount: RESERVE_INITIAL_BALANCE,
      balanceAfter: RESERVE_INITIAL_BALANCE,
      description: "Initial reserve seed on demo reset",
    },
  });

  return NextResponse.json({ success: true, message: "Demo data reset complete." });
}
