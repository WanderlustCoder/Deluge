import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { simulateAdRevenue, SHARE_PRICE } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.communityProject.deleteMany();
  await prisma.communityMember.deleteMany();
  await prisma.community.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.streak.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.loanRepayment.deleteMany();
  await prisma.loanShare.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.watershedTransaction.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.adView.deleteMany();
  await prisma.contribution.deleteMany();
  await prisma.watershed.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hash("password123", 12);

  // --- Users ---
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@deluge.fund",
      passwordHash,
      role: "admin",
      watershed: { create: { balance: 0, totalInflow: 0, totalOutflow: 0 } },
    },
    include: { watershed: true },
  });

  const angela = await prisma.user.create({
    data: {
      name: "Angela Martinez",
      email: "angela@example.com",
      passwordHash,
      role: "user",
      watershed: {
        create: { balance: 12.5, totalInflow: 45.0, totalOutflow: 32.5 },
      },
    },
    include: { watershed: true },
  });

  const deandre = await prisma.user.create({
    data: {
      name: "DeAndre Johnson",
      email: "deandre@example.com",
      passwordHash,
      role: "user",
      watershed: {
        create: { balance: 3.2, totalInflow: 3.2, totalOutflow: 0 },
      },
    },
    include: { watershed: true },
  });

  const demo = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@deluge.fund",
      passwordHash,
      role: "user",
      watershed: { create: { balance: 0, totalInflow: 0, totalOutflow: 0 } },
    },
    include: { watershed: true },
  });

  // --- Projects ---
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        title: "Montbello Fresh Food Market",
        description:
          "Bringing a community-owned fresh food market to the Montbello food desert. This project will convert a vacant lot into a vibrant marketplace with local produce, affordable groceries, and space for community cooking classes.",
        category: "Community",
        fundingGoal: 15000,
        fundingRaised: 14250, // 95% — cascade demo trigger!
        backerCount: 187,
        status: "active",
        location: "Montbello, Denver CO",
      },
    }),
    prisma.project.create({
      data: {
        title: "Park Hill Youth Coding Lab",
        description:
          "Free after-school coding program for middle schoolers in Park Hill. Students learn Python, web development, and game design with mentorship from local tech professionals.",
        category: "Education",
        fundingGoal: 8000,
        fundingRaised: 5600, // 70%
        backerCount: 92,
        status: "active",
        location: "Park Hill, Denver CO",
      },
    }),
    prisma.project.create({
      data: {
        title: "Five Points Community Garden",
        description:
          "Transforming an abandoned lot in Five Points into a thriving community garden with 40 raised beds, a tool library, composting station, and weekend farmer's market.",
        category: "Environment",
        fundingGoal: 5000,
        fundingRaised: 2500, // 50%
        backerCount: 64,
        status: "active",
        location: "Five Points, Denver CO",
      },
    }),
    prisma.project.create({
      data: {
        title: "Westwood Mental Health Hub",
        description:
          "Opening a bilingual (English/Spanish) mental health resource center offering free counseling, support groups, and crisis intervention for the Westwood community.",
        category: "Health",
        fundingGoal: 20000,
        fundingRaised: 5000, // 25%
        backerCount: 73,
        status: "active",
        location: "Westwood, Denver CO",
      },
    }),
    prisma.project.create({
      data: {
        title: "Globeville Street Art Trail",
        description:
          "Creating a walking trail of 12 murals celebrating Globeville's immigrant heritage. Local and visiting artists will work with community members to design and paint murals on building walls throughout the neighborhood.",
        category: "Arts & Culture",
        fundingGoal: 12000,
        fundingRaised: 1200, // 10%
        backerCount: 31,
        status: "active",
        location: "Globeville, Denver CO",
      },
    }),
    prisma.project.create({
      data: {
        title: "Sun Valley Tech Access Program",
        description:
          "Providing refurbished laptops and free internet hotspots to 200 families in Sun Valley, along with digital literacy workshops for parents and seniors.",
        category: "Technology",
        fundingGoal: 10000,
        fundingRaised: 7500, // 75%
        backerCount: 118,
        status: "active",
        location: "Sun Valley, Denver CO",
      },
    }),
    prisma.project.create({
      data: {
        title: "Elyria-Swansea Youth Sports League",
        description:
          "Year-round youth sports program offering soccer, basketball, and track for kids ages 8-16. Includes equipment, uniforms, transportation to games, and healthy post-practice meals.",
        category: "Youth",
        fundingGoal: 9000,
        fundingRaised: 3600, // 40%
        backerCount: 55,
        status: "active",
        location: "Elyria-Swansea, Denver CO",
      },
    }),
    prisma.project.create({
      data: {
        title: "Cole Neighborhood Tiny Home Village",
        description:
          "Building a pilot tiny home village with 8 units for unhoused individuals transitioning to permanent housing. Includes shared kitchen, laundry, and case management services.",
        category: "Housing",
        fundingGoal: 25000,
        fundingRaised: 25000, // 100% — completed
        backerCount: 312,
        status: "funded",
        location: "Cole, Denver CO",
      },
    }),
  ]);

  // --- Seed transactions for Angela ---
  if (angela.watershed) {
    // Ad view history (variable revenue per ad)
    for (let i = 0; i < 20; i++) {
      const ad = simulateAdRevenue();
      await prisma.adView.create({
        data: {
          userId: angela.id,
          grossRevenue: ad.grossRevenue,
          platformCut: ad.platformCut,
          watershedCredit: ad.watershedCredit,
        },
      });
    }

    // Cash contributions
    await prisma.contribution.create({
      data: {
        userId: angela.id,
        amount: 25.0,
        type: "cash",
        watershedCredit: 25.0,
      },
    });
    await prisma.contribution.create({
      data: {
        userId: angela.id,
        amount: 19.82,
        type: "cash",
        watershedCredit: 19.82,
      },
    });

    // Watershed transactions
    await prisma.watershedTransaction.create({
      data: {
        watershedId: angela.watershed.id,
        type: "cash_contribution",
        amount: 25.0,
        description: "Cash contribution",
        balanceAfter: 25.0,
      },
    });
    await prisma.watershedTransaction.create({
      data: {
        watershedId: angela.watershed.id,
        type: "cash_contribution",
        amount: 19.82,
        description: "Cash contribution",
        balanceAfter: 44.82,
      },
    });
    await prisma.watershedTransaction.create({
      data: {
        watershedId: angela.watershed.id,
        type: "ad_credit",
        amount: 0.18,
        description: "20 ads watched",
        balanceAfter: 45.0,
      },
    });
    await prisma.watershedTransaction.create({
      data: {
        watershedId: angela.watershed.id,
        type: "project_allocation",
        amount: -15.0,
        description: "Funded: Park Hill Youth Coding Lab",
        balanceAfter: 30.0,
      },
    });
    await prisma.watershedTransaction.create({
      data: {
        watershedId: angela.watershed.id,
        type: "project_allocation",
        amount: -17.5,
        description: "Funded: Montbello Fresh Food Market",
        balanceAfter: 12.5,
      },
    });

    // Allocations
    await prisma.allocation.create({
      data: {
        userId: angela.id,
        projectId: projects[1].id, // Park Hill Youth Coding Lab
        amount: 15.0,
      },
    });
    await prisma.allocation.create({
      data: {
        userId: angela.id,
        projectId: projects[0].id, // Montbello Fresh Food Market
        amount: 17.5,
      },
    });
  }

  // --- Seed transactions for DeAndre ---
  if (deandre.watershed) {
    let deandreAdTotal = 0;
    for (let i = 0; i < 10; i++) {
      const ad = simulateAdRevenue();
      deandreAdTotal += ad.watershedCredit;
      await prisma.adView.create({
        data: {
          userId: deandre.id,
          grossRevenue: ad.grossRevenue,
          platformCut: ad.platformCut,
          watershedCredit: ad.watershedCredit,
        },
      });
    }

    await prisma.watershedTransaction.create({
      data: {
        watershedId: deandre.watershed.id,
        type: "ad_credit",
        amount: parseFloat(deandreAdTotal.toFixed(4)),
        description: "10 ads watched",
        balanceAfter: parseFloat(deandreAdTotal.toFixed(4)),
      },
    });

    await prisma.contribution.create({
      data: {
        userId: deandre.id,
        amount: 3.11,
        type: "simulated",
        watershedCredit: 3.11,
      },
    });

    await prisma.watershedTransaction.create({
      data: {
        watershedId: deandre.watershed.id,
        type: "cash_contribution",
        amount: 3.11,
        description: "Simulated contribution",
        balanceAfter: 3.2,
      },
    });
  }

  // --- Badge Definitions ---
  const badgeDefs = [
    { key: "first_ad", name: "Time Giver", description: "Watch your first ad", tier: "first_drop", icon: "⏱️" },
    { key: "first_fund", name: "First Backer", description: "Fund your first project", tier: "first_drop", icon: "🤝" },
    { key: "first_contribution", name: "First Drop", description: "Make your first cash contribution", tier: "first_drop", icon: "💧" },
    { key: "ads_10", name: "Dedicated Viewer", description: "Watch 10 ads", tier: "stream", icon: "📺" },
    { key: "ads_100", name: "Century Watcher", description: "Watch 100 ads", tier: "stream", icon: "💯" },
    { key: "projects_3", name: "Triple Backer", description: "Fund 3 different projects", tier: "stream", icon: "🎯" },
    { key: "projects_10", name: "Community Pillar", description: "Fund 10 different projects", tier: "creek", icon: "🏛️" },
    { key: "week_streak", name: "Week Streak", description: "Watch ads 7 days in a row", tier: "stream", icon: "🔥" },
    { key: "month_streak", name: "Monthly Devotion", description: "Watch ads 30 days in a row", tier: "creek", icon: "⭐" },
  ];

  for (const def of badgeDefs) {
    await prisma.badge.create({ data: def });
  }

  // Give Angela some badges (she has 20 ads + 2 projects funded)
  const angelaBadges = await prisma.badge.findMany({
    where: { key: { in: ["first_ad", "ads_10", "first_fund", "first_contribution"] } },
  });
  for (const badge of angelaBadges) {
    await prisma.userBadge.create({
      data: { userId: angela.id, badgeId: badge.id },
    });
  }

  // Give DeAndre first_ad badge (10 ads)
  const deAndreBadges = await prisma.badge.findMany({
    where: { key: { in: ["first_ad", "ads_10"] } },
  });
  for (const badge of deAndreBadges) {
    await prisma.userBadge.create({
      data: { userId: deandre.id, badgeId: badge.id },
    });
  }

  // --- Loans ---
  const deadline1 = new Date();
  deadline1.setDate(deadline1.getDate() + 5);

  const loan1Amount = 50;
  const loan1Shares = loan1Amount / SHARE_PRICE; // 200
  const loan1FundedShares = 120; // 60%

  const loan1 = await prisma.loan.create({
    data: {
      borrowerId: deandre.id,
      amount: loan1Amount,
      totalShares: loan1Shares,
      sharesRemaining: loan1Shares - loan1FundedShares,
      purpose: "Buy supplies for community tutoring",
      purposeCategory: "Education",
      story: "I run a free tutoring program for neighborhood kids and need supplies like workbooks, markers, and a small whiteboard.",
      location: "Park Hill, Denver CO",
      status: "funding",
      fundingDeadline: deadline1,
      repaymentMonths: 4,
      monthlyPayment: loan1Amount / 4,
    },
  });

  // Angela funded 120 shares of loan1
  await prisma.loanShare.create({
    data: {
      loanId: loan1.id,
      funderId: angela.id,
      count: loan1FundedShares,
      amount: loan1FundedShares * SHARE_PRICE,
    },
  });

  // Loan 2: active with some repayments
  const deadline2 = new Date();
  deadline2.setDate(deadline2.getDate() - 10); // already past

  const loan2Amount = 75;
  const loan2Shares = loan2Amount / SHARE_PRICE; // 300
  const loan2MonthlyPayment = loan2Amount / 6;

  const loan2 = await prisma.loan.create({
    data: {
      borrowerId: angela.id,
      amount: loan2Amount,
      totalShares: loan2Shares,
      sharesRemaining: 0,
      purpose: "Emergency car repair for work commute",
      purposeCategory: "Transportation",
      story: "My car broke down and I need it to get to my job. Public transit doesn't reach my workplace.",
      location: "Montbello, Denver CO",
      status: "repaying",
      fundingDeadline: deadline2,
      repaymentMonths: 6,
      monthlyPayment: loan2MonthlyPayment,
    },
  });

  // DeAndre funded all shares of loan2
  await prisma.loanShare.create({
    data: {
      loanId: loan2.id,
      funderId: deandre.id,
      count: loan2Shares,
      amount: loan2Amount,
    },
  });

  // 2 repayments made on loan2
  for (let i = 0; i < 2; i++) {
    const servicingFee = loan2MonthlyPayment * 0.02;
    const principalPaid = loan2MonthlyPayment - servicingFee;
    await prisma.loanRepayment.create({
      data: {
        loanId: loan2.id,
        amount: loan2MonthlyPayment,
        principalPaid,
        servicingFee,
      },
    });
  }

  // --- Communities ---
  const community1 = await prisma.community.create({
    data: {
      name: "Park Hill Neighbors",
      description: "Working together to build a stronger Park Hill neighborhood through community projects, events, and mutual support.",
      location: "Park Hill, Denver CO",
      category: "Neighborhood",
      createdBy: angela.id,
      memberCount: 2,
      members: {
        create: [
          { userId: angela.id, role: "admin" },
          { userId: deandre.id, role: "member" },
        ],
      },
    },
  });

  // Link 3 projects to community1
  await prisma.communityProject.createMany({
    data: [
      { communityId: community1.id, projectId: projects[1].id, addedBy: angela.id }, // Park Hill Youth Coding Lab
      { communityId: community1.id, projectId: projects[2].id, addedBy: angela.id }, // Five Points Community Garden
      { communityId: community1.id, projectId: projects[5].id, addedBy: angela.id }, // Sun Valley Tech Access
    ],
  });

  const community2 = await prisma.community.create({
    data: {
      name: "Denver Education Coalition",
      description: "Parents, teachers, and community members united to expand educational opportunities across Denver neighborhoods.",
      category: "Education",
      createdBy: deandre.id,
      memberCount: 1,
      members: {
        create: [
          { userId: deandre.id, role: "admin" },
        ],
      },
    },
  });

  await prisma.communityProject.createMany({
    data: [
      { communityId: community2.id, projectId: projects[1].id, addedBy: deandre.id }, // Park Hill Youth Coding Lab
      { communityId: community2.id, projectId: projects[5].id, addedBy: deandre.id }, // Sun Valley Tech Access
    ],
  });

  console.log("Seed complete!");
  console.log(`  Users: ${4} (admin, angela, deandre, demo)`);
  console.log(`  Projects: ${projects.length}`);
  console.log("");
  console.log("Login credentials (all users):");
  console.log("  Password: password123");
  console.log("  Admin:    admin@deluge.fund");
  console.log("  Angela:   angela@example.com");
  console.log("  DeAndre:  deandre@example.com");
  console.log("  Demo:     demo@deluge.fund");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
