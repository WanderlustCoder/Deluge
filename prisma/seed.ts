import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { simulateAdRevenue, SHARE_PRICE, RESERVE_INITIAL_BALANCE } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.efficiencyPhase.deleteMany();
  await prisma.efficiencyAssessment.deleteMany();
  await prisma.efficiencyNomination.deleteMany();
  await prisma.efficiencyHome.deleteMany();
  await prisma.neighborhoodCascade.deleteMany();
  await prisma.reserveTransaction.deleteMany();
  await prisma.platformReserve.deleteMany();
  await prisma.projectDisbursement.deleteMany();
  await prisma.revenueSettlement.deleteMany();
  await prisma.flagshipSponsor.deleteMany();
  await prisma.flagshipVote.deleteMany();
  await prisma.flagshipProject.deleteMany();
  await prisma.strategicPlan.deleteMany();
  await prisma.aquiferContribution.deleteMany();
  await prisma.aquifer.deleteMany();
  await prisma.electionVote.deleteMany();
  await prisma.electionNomination.deleteMany();
  await prisma.communityElection.deleteMany();
  await prisma.loanSponsorship.deleteMany();
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
  await prisma.userRole.deleteMany();
  await prisma.roleConfig.deleteMany();
  await prisma.adminInvite.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hash("password123", 12);

  // --- Users ---
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@deluge.fund",
      passwordHash,
      accountType: "admin",
      watershed: { create: { balance: 0, totalInflow: 0, totalOutflow: 0 } },
    },
    include: { watershed: true },
  });

  const angela = await prisma.user.create({
    data: {
      name: "Angela Martinez",
      email: "angela@example.com",
      passwordHash,
      accountType: "user",
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
      accountType: "user",
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
      accountType: "user",
      watershed: { create: { balance: 0, totalInflow: 0, totalOutflow: 0 } },
    },
    include: { watershed: true },
  });

  // --- Projects ---
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        title: "Bench Fresh Food Market",
        description:
          "Bringing a community-owned fresh food market to the Bench food desert. This project will convert a vacant lot into a vibrant marketplace with local produce, affordable groceries, and space for community cooking classes.",
        category: "Community",
        fundingGoal: 15000,
        fundingRaised: 14250, // 95% — cascade demo trigger!
        backerCount: 187,
        status: "active",
        location: "Bench, Boise ID",
      },
    }),
    prisma.project.create({
      data: {
        title: "North End Youth Coding Lab",
        description:
          "Free after-school coding program for middle schoolers in the North End. Students learn Python, web development, and game design with mentorship from local tech professionals.",
        category: "Education",
        fundingGoal: 8000,
        fundingRaised: 5600, // 70%
        backerCount: 92,
        status: "active",
        location: "North End, Boise ID",
      },
    }),
    prisma.project.create({
      data: {
        title: "Downtown Boise Community Garden",
        description:
          "Transforming an abandoned lot in downtown Boise into a thriving community garden with 40 raised beds, a tool library, composting station, and weekend farmer's market.",
        category: "Environment",
        fundingGoal: 5000,
        fundingRaised: 2500, // 50%
        backerCount: 64,
        status: "active",
        location: "Downtown, Boise ID",
      },
    }),
    prisma.project.create({
      data: {
        title: "Garden City Mental Health Hub",
        description:
          "Opening a bilingual (English/Spanish) mental health resource center offering free counseling, support groups, and crisis intervention for the Garden City community.",
        category: "Health",
        fundingGoal: 20000,
        fundingRaised: 5000, // 25%
        backerCount: 73,
        status: "active",
        location: "Garden City, ID",
      },
    }),
    prisma.project.create({
      data: {
        title: "Meridian Cultural Art Trail",
        description:
          "Creating a walking trail of 12 murals celebrating Meridian's diverse heritage. Local and visiting artists will work with community members to design and paint murals on building walls throughout the neighborhood.",
        category: "Arts & Culture",
        fundingGoal: 12000,
        fundingRaised: 1200, // 10%
        backerCount: 31,
        status: "active",
        location: "Meridian, ID",
      },
    }),
    prisma.project.create({
      data: {
        title: "Nampa Tech Access Program",
        description:
          "Providing refurbished laptops and free internet hotspots to 200 families in Nampa, along with digital literacy workshops for parents and seniors.",
        category: "Technology",
        fundingGoal: 10000,
        fundingRaised: 7500, // 75%
        backerCount: 118,
        status: "active",
        location: "Nampa, ID",
      },
    }),
    prisma.project.create({
      data: {
        title: "Eagle Youth Sports League",
        description:
          "Year-round youth sports program offering soccer, basketball, and track for kids ages 8-16. Includes equipment, uniforms, transportation to games, and healthy post-practice meals.",
        category: "Youth",
        fundingGoal: 9000,
        fundingRaised: 3600, // 40%
        backerCount: 55,
        status: "active",
        location: "Eagle, ID",
      },
    }),
    prisma.project.create({
      data: {
        title: "Caldwell Tiny Home Village",
        description:
          "Building a pilot tiny home village with 8 units for unhoused individuals transitioning to permanent housing. Includes shared kitchen, laundry, and case management services.",
        category: "Housing",
        fundingGoal: 25000,
        fundingRaised: 25000, // 100% — completed
        backerCount: 312,
        status: "funded",
        location: "Caldwell, ID",
      },
    }),
  ]);

  // --- Seed transactions for Angela ---
  if (angela.watershed) {
    // Ad view history (variable revenue per ad) — all marked as cleared for demo
    for (let i = 0; i < 20; i++) {
      const ad = simulateAdRevenue();
      await prisma.adView.create({
        data: {
          userId: angela.id,
          grossRevenue: ad.grossRevenue,
          platformCut: ad.platformCut,
          watershedCredit: ad.watershedCredit,
          settlementStatus: "cleared",
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
        description: "Funded: North End Youth Coding Lab",
        balanceAfter: 30.0,
      },
    });
    await prisma.watershedTransaction.create({
      data: {
        watershedId: angela.watershed.id,
        type: "project_allocation",
        amount: -17.5,
        description: "Funded: Bench Fresh Food Market",
        balanceAfter: 12.5,
      },
    });

    // Allocations
    await prisma.allocation.create({
      data: {
        userId: angela.id,
        projectId: projects[1].id, // North End Youth Coding Lab
        amount: 15.0,
      },
    });
    await prisma.allocation.create({
      data: {
        userId: angela.id,
        projectId: projects[0].id, // Bench Fresh Food Market
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
          settlementStatus: "cleared",
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
    { key: "first_volunteer", name: "First Hour", description: "Log your first volunteer hour", tier: "first_drop", icon: "🙋" },
    { key: "ads_10", name: "Dedicated Viewer", description: "Watch 10 ads", tier: "stream", icon: "📺" },
    { key: "ads_100", name: "Century Watcher", description: "Watch 100 ads", tier: "stream", icon: "💯" },
    { key: "projects_3", name: "Triple Backer", description: "Fund 3 different projects", tier: "stream", icon: "🎯" },
    { key: "projects_10", name: "Community Pillar", description: "Fund 10 different projects", tier: "creek", icon: "🏛️" },
    { key: "week_streak", name: "Week Streak", description: "Watch ads 7 days in a row", tier: "stream", icon: "🔥" },
    { key: "month_streak", name: "Monthly Devotion", description: "Watch ads 30 days in a row", tier: "creek", icon: "⭐" },
    { key: "volunteer_10", name: "Helping Hand", description: "Log 10 volunteer hours", tier: "stream", icon: "🤲" },
    { key: "volunteer_50", name: "Community Hero", description: "Log 50 volunteer hours", tier: "creek", icon: "🦸" },
    { key: "volunteer_100", name: "Century Volunteer", description: "Log 100 volunteer hours", tier: "river", icon: "🏆" },
    { key: "circle_joiner", name: "Circle Joiner", description: "Join your first giving circle", tier: "first_drop", icon: "⭕" },
    { key: "circle_active", name: "Circle Active", description: "Join 3 giving circles", tier: "stream", icon: "🔗" },
    { key: "circle_proposer", name: "Circle Proposer", description: "Create your first circle proposal", tier: "stream", icon: "📝" },
    // Seasonal giving badges
    { key: "gift_giver", name: "Gift Giver", description: "Send your first gift contribution", tier: "first_drop", icon: "🎁" },
    { key: "generous_gifter", name: "Generous Gifter", description: "Send 5 gift contributions", tier: "stream", icon: "💝" },
    { key: "birthday_host", name: "Birthday Host", description: "Create a birthday fundraiser", tier: "stream", icon: "🎂" },
    { key: "first_responder", name: "First Responder", description: "Donate to an emergency campaign", tier: "first_drop", icon: "🚨" },
    { key: "crisis_hero", name: "Crisis Hero", description: "Donate to 5 emergency campaigns", tier: "creek", icon: "🦸" },
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
      location: "North End, Boise ID",
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
      location: "Bench, Boise ID",
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
      name: "North End Neighbors",
      description: "Working together to build a stronger North End neighborhood through community projects, events, and mutual support.",
      location: "North End, Boise ID",
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
      { communityId: community1.id, projectId: projects[1].id, addedBy: angela.id }, // North End Youth Coding Lab
      { communityId: community1.id, projectId: projects[2].id, addedBy: angela.id }, // Downtown Boise Community Garden
      { communityId: community1.id, projectId: projects[5].id, addedBy: angela.id }, // Nampa Tech Access
    ],
  });

  const community2 = await prisma.community.create({
    data: {
      name: "Treasure Valley Education Coalition",
      description: "Parents, teachers, and community members united to expand educational opportunities across Treasure Valley neighborhoods.",
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
      { communityId: community2.id, projectId: projects[1].id, addedBy: deandre.id }, // North End Youth Coding Lab
      { communityId: community2.id, projectId: projects[5].id, addedBy: deandre.id }, // Nampa Tech Access
    ],
  });

  // --- Role Configs ---
  const roleConfigs = [
    {
      role: "verified_giver",
      displayName: "Verified Giver",
      description: "Funded 5+ distinct projects or loan shares",
      thresholds: JSON.stringify({ minProjectsFunded: 5, minLoansFunded: 5, requireEither: true }),
      isAutomatic: true,
    },
    {
      role: "sponsor",
      displayName: "Sponsor",
      description: "Verified giver with $50+ total contributions",
      thresholds: JSON.stringify({ requiresRole: "verified_giver", minContributionTotal: 50 }),
      isAutomatic: true,
    },
    {
      role: "trusted_borrower",
      displayName: "Trusted Borrower",
      description: "Credit tier 3+ with strong repayment history",
      thresholds: JSON.stringify({ minCreditTier: 3 }),
      isAutomatic: true,
    },
    {
      role: "mentor",
      displayName: "Mentor",
      description: "Manually nominated community mentor",
      thresholds: JSON.stringify({ manual: true }),
      isAutomatic: false,
    },
  ];

  for (const rc of roleConfigs) {
    await prisma.roleConfig.create({ data: rc });
  }

  // --- Aquifer System ---
  const reserveAquifer = await prisma.aquifer.create({
    data: { type: "reserve", balance: 25000 },
  });

  const poolAquifer = await prisma.aquifer.create({
    data: { type: "pool", balance: 8500 },
  });

  // Add some Deluge contributions to Reserve
  await prisma.aquiferContribution.create({
    data: {
      aquiferId: reserveAquifer.id,
      amount: 25000,
      isDeluge: true,
      note: "Initial Reserve funding",
    },
  });

  // Add user contributions to Pool
  await prisma.aquiferContribution.create({
    data: {
      aquiferId: poolAquifer.id,
      userId: angela.id,
      amount: 5.00,
      isDeluge: false,
    },
  });

  await prisma.aquiferContribution.create({
    data: {
      aquiferId: poolAquifer.id,
      amount: 8495,
      isDeluge: true,
      note: "Matching funds",
    },
  });

  // --- Strategic Plans ---
  const solarizePlan = await prisma.strategicPlan.create({
    data: {
      title: "Solarize West Boise",
      description:
        "Installing community solar infrastructure across the West Boise neighborhood to reduce energy costs for low-income families.",
      vision:
        "West Boise has some of the highest energy burden rates in Idaho. Families spend up to 15% of their income on electricity. By installing community solar on public buildings, schools, and affordable housing, we can cut those bills in half. This isn't just about solar panels—it's about energy justice. Every dollar saved on electricity is a dollar that can go toward food, medicine, or a child's education. Our vision: West Boise becomes the first carbon-neutral neighborhood in Boise, powered by the sun and owned by the community.",
      fundingGoal: 50000,
      status: "active",
      order: 0,
    },
  });

  // Queue a future plan
  await prisma.strategicPlan.create({
    data: {
      title: "Green Jobs Training Center",
      description:
        "Building a workforce development center focused on green jobs in renewable energy, weatherization, and sustainable construction.",
      vision:
        "The transition to clean energy must create local jobs for local people. This training center will prepare residents for careers in solar installation, energy auditing, electric vehicle maintenance, and more. We're not just teaching skills—we're building pathways out of poverty.",
      fundingGoal: 75000,
      status: "funded",
      order: 1,
    },
  });

  // --- Flagship Projects ---
  // 1. Active (Reserve-funded) - no voting needed
  const flagshipProject1 = await prisma.project.create({
    data: {
      title: "Treasure Valley Regional Food Hub",
      description: "A central distribution hub connecting local farms with food-insecure neighborhoods across the Treasure Valley. This flagship initiative will reduce food waste, create local jobs, and ensure fresh produce reaches communities that need it most. The hub will feature cold storage, a commercial kitchen for value-added processing, and a fleet of electric delivery vehicles.",
      category: "Community",
      fundingGoal: 50000,
      fundingRaised: 12500,
      backerCount: 0,
      status: "active",
      location: "Boise, ID",
      isFlagship: true,
    },
  });

  await prisma.flagshipProject.create({
    data: {
      projectId: flagshipProject1.id,
      status: "active",
      fundingSource: "reserve",
      strategicPlanId: solarizePlan.id,
    },
  });

  // 2. Voting (Pool-funded) - community vote in progress
  const votingEndsAt = new Date();
  votingEndsAt.setDate(votingEndsAt.getDate() + 25);

  const flagshipProject2 = await prisma.project.create({
    data: {
      title: "Idaho Youth Climate Corps",
      description: "A paid summer program for high school students to work on climate resilience projects across Idaho communities. Youth will learn about renewable energy, urban forestry, water conservation, and sustainable agriculture while earning wages and building skills for green careers.",
      category: "Youth",
      fundingGoal: 35000,
      fundingRaised: 0,
      backerCount: 0,
      status: "active",
      location: "Statewide, ID",
      isFlagship: true,
    },
  });

  const flagship2 = await prisma.flagshipProject.create({
    data: {
      projectId: flagshipProject2.id,
      status: "voting",
      fundingSource: "pool",
      votingEndsAt,
    },
  });

  // Give Angela verified_giver role so she can vote
  await prisma.userRole.create({
    data: {
      userId: angela.id,
      role: "verified_giver",
    },
  });

  // Add a sample vote from Angela
  await prisma.flagshipVote.create({
    data: {
      flagshipProjectId: flagship2.id,
      userId: angela.id,
      vote: "approve",
    },
  });

  // 3. Tabled (Pool-funded) - was voted to table
  const tabledAt = new Date();
  tabledAt.setDate(tabledAt.getDate() - 10);

  const flagshipProject3 = await prisma.project.create({
    data: {
      title: "Treasure Valley Tiny Home Initiative",
      description: "Building a network of tiny home villages across the Treasure Valley to provide transitional housing for individuals experiencing homelessness. Each village will have 20 units with shared amenities and on-site case management.",
      category: "Housing",
      fundingGoal: 75000,
      fundingRaised: 0,
      backerCount: 0,
      status: "active",
      location: "Treasure Valley, ID",
      isFlagship: true,
    },
  });

  const flagship3 = await prisma.flagshipProject.create({
    data: {
      projectId: flagshipProject3.id,
      status: "tabled",
      fundingSource: "pool",
      tabledAt,
    },
  });

  // Add Angela as a sponsor for the tabled project
  await prisma.flagshipSponsor.create({
    data: {
      flagshipProjectId: flagship3.id,
      userId: angela.id,
    },
  });

  // --- Platform Reserve ---
  const platformReserve = await prisma.platformReserve.create({
    data: {
      balance: RESERVE_INITIAL_BALANCE,
      totalInflow: RESERVE_INITIAL_BALANCE,
      totalOutflow: 0,
      totalReplenished: RESERVE_INITIAL_BALANCE,
    },
  });

  await prisma.reserveTransaction.create({
    data: {
      reserveId: platformReserve.id,
      type: "manual_adjustment",
      amount: RESERVE_INITIAL_BALANCE,
      balanceAfter: RESERVE_INITIAL_BALANCE,
      description: "Initial reserve seed",
    },
  });

  // --- Home Efficiency Program (Plan 42) ---

  // Strategic Plan for Home Efficiency Initiative
  const efficiencyPlan = await prisma.strategicPlan.create({
    data: {
      title: "Home Efficiency Initiative",
      description:
        "Deluge's flagship mission: upgrading homes to be energy-efficient and capable of localized electricity generation, reducing strain on the power grid from the demand side.",
      vision:
        "Improve the power grid by making homes more efficient and enabling localized electricity creation. More localization means less transmission load. The path: reduce consumption through insulation, sealing, and efficient windows; strengthen infrastructure with roofs that can support solar; generate locally with solar panels on every upgraded home; and achieve grid impact through less demand plus distributed generation creating a more resilient grid.",
      fundingGoal: 200000,
      status: "active",
      order: 0,
    },
  });

  // Update existing strategic plans to order after efficiency
  await prisma.strategicPlan.updateMany({
    where: { id: { not: efficiencyPlan.id } },
    data: { order: 2 },
  });

  // 1. Angela's home — fully assessed, Phase 1 funded & in progress, Phase 2 funding
  const angelaHome = await prisma.efficiencyHome.create({
    data: {
      userId: angela.id,
      address: "2847 N 15th Street",
      city: "Boise",
      state: "ID",
      zipCode: "83702",
      homeType: "single_family",
      yearBuilt: 1962,
      squareFootage: 1450,
      ownershipStatus: "owner",
      entryTrack: "individual",
      status: "in_progress",
      currentEnergyBill: 185,
      energyScoreBefore: 32,
      roofOrientation: "south",
      shadingFactor: "partial",
      solarCapacityKw: 6.5,
      solarGenerationKwh: 9100,
      assessedAt: new Date(Date.now() - 30 * 86400000), // 30 days ago
    },
  });

  await prisma.efficiencyAssessment.create({
    data: {
      homeId: angelaHome.id,
      insulationCondition: "poor",
      windowType: "single",
      hvacAge: 18,
      hvacType: "furnace",
      waterHeaterType: "tank_gas",
      roofCondition: "fair",
      electricalPanelAmps: 100,
      efficiencyScore: 32,
      upgradePlan: JSON.stringify([
        { category: "insulation", priority: 1, needed: true, notes: "Current: poor" },
        { category: "air_sealing", priority: 2, needed: true, notes: "Standard weatherization" },
        { category: "doors", priority: 3, needed: true, notes: "Exterior door assessment" },
        { category: "windows", priority: 4, needed: true, notes: "Current: single pane" },
        { category: "hvac", priority: 5, needed: true, notes: "Age: 18 years, Type: furnace" },
        { category: "water_heating", priority: 6, needed: true, notes: "Current: tank_gas" },
        { category: "electrical_panel", priority: 7, needed: true, notes: "Current: 100A (need 200A for solar)" },
        { category: "roof_reinforcement", priority: 8, needed: true, notes: "Roof condition: fair" },
        { category: "solar", priority: 9, needed: true, notes: "Solar installation" },
      ]),
      totalEstimatedCost: 42500,
      projectedSavingsKwh: 8200,
      projectedSavingsDollars: 1312,
      projectedCo2Reduction: 3.42,
      assessedBy: admin.id,
      assessorNotes: "1962 ranch-style home. Original windows, minimal insulation in attic. Furnace is past expected life. South-facing roof is excellent for solar. Strong candidate for full 5-phase upgrade.",
    },
  });

  // Create Project records for Angela's phases that are active/funding
  const angelaPhase1Project = await prisma.project.create({
    data: {
      title: "2847 N 15th St — Phase 1: Envelope",
      description: "Insulation, air sealing, and door upgrades for a 1962 ranch-style home in the North End. This is the first phase of a full efficiency upgrade — sealing the thermal envelope to stop heating and cooling loss. Estimated 20-30% immediate reduction in energy consumption.",
      category: "Energy",
      fundingGoal: 6800,
      fundingRaised: 6800,
      backerCount: 24,
      status: "funded",
      location: "North End, Boise ID",
      isFlagship: true,
    },
  });

  await prisma.flagshipProject.create({
    data: {
      projectId: angelaPhase1Project.id,
      status: "funded",
      fundingSource: "reserve",
      strategicPlanId: efficiencyPlan.id,
    },
  });

  const angelaPhase2Project = await prisma.project.create({
    data: {
      title: "2847 N 15th St — Phase 2: Windows",
      description: "Replacing single-pane windows with double-pane energy-efficient windows throughout the home. This completes the thermal envelope started in Phase 1, eliminating the biggest remaining source of heat transfer. Expected to reduce energy bills by an additional 8-12%.",
      category: "Energy",
      fundingGoal: 9200,
      fundingRaised: 3680,
      backerCount: 15,
      status: "active",
      location: "North End, Boise ID",
      isFlagship: true,
    },
  });

  await prisma.flagshipProject.create({
    data: {
      projectId: angelaPhase2Project.id,
      status: "active",
      fundingSource: "reserve",
      strategicPlanId: efficiencyPlan.id,
    },
  });

  // Angela's phases (linked to projects)
  await prisma.efficiencyPhase.create({
    data: {
      homeId: angelaHome.id,
      phaseNumber: 1,
      phaseName: "envelope",
      categories: JSON.stringify(["insulation", "air_sealing", "doors"]),
      estimatedCost: 6800,
      amountFunded: 6800,
      fundingComplete: true,
      fundingTrack: "fully_funded",
      status: "in_progress",
      contractorName: "Treasure Valley Weatherization Co.",
      startedAt: new Date(Date.now() - 7 * 86400000),
      projectId: angelaPhase1Project.id,
    },
  });

  await prisma.efficiencyPhase.create({
    data: {
      homeId: angelaHome.id,
      phaseNumber: 2,
      phaseName: "openings",
      categories: JSON.stringify(["windows"]),
      estimatedCost: 9200,
      amountFunded: 3680,
      fundingTrack: "co_pay",
      status: "funding",
      projectId: angelaPhase2Project.id,
    },
  });

  await prisma.efficiencyPhase.create({
    data: {
      homeId: angelaHome.id,
      phaseNumber: 3,
      phaseName: "systems",
      categories: JSON.stringify(["hvac", "water_heating"]),
      estimatedCost: 12500,
      status: "pending",
    },
  });

  await prisma.efficiencyPhase.create({
    data: {
      homeId: angelaHome.id,
      phaseNumber: 4,
      phaseName: "electrical",
      categories: JSON.stringify(["electrical_panel"]),
      estimatedCost: 3200,
      status: "pending",
    },
  });

  await prisma.efficiencyPhase.create({
    data: {
      homeId: angelaHome.id,
      phaseNumber: 5,
      phaseName: "generation",
      categories: JSON.stringify(["roof_reinforcement", "solar"]),
      estimatedCost: 24500,
      status: "pending",
    },
  });

  // 2. DeAndre's home — just applied, awaiting assessment
  await prisma.efficiencyHome.create({
    data: {
      userId: deandre.id,
      address: "1523 S Owyhee Street",
      city: "Boise",
      state: "ID",
      zipCode: "83705",
      homeType: "duplex",
      yearBuilt: 1948,
      squareFootage: 1100,
      ownershipStatus: "owner",
      entryTrack: "individual",
      status: "applied",
      currentEnergyBill: 210,
    },
  });

  // 3. Demo user's home — assessed but not yet funding
  const demoHome = await prisma.efficiencyHome.create({
    data: {
      userId: demo.id,
      address: "4401 W Emerald Street",
      city: "Boise",
      state: "ID",
      zipCode: "83706",
      homeType: "single_family",
      yearBuilt: 1978,
      squareFootage: 1680,
      ownershipStatus: "owner",
      entryTrack: "individual",
      status: "assessed",
      currentEnergyBill: 165,
      energyScoreBefore: 45,
      roofOrientation: "east",
      shadingFactor: "none",
      assessedAt: new Date(Date.now() - 10 * 86400000),
    },
  });

  await prisma.efficiencyAssessment.create({
    data: {
      homeId: demoHome.id,
      insulationCondition: "fair",
      windowType: "single",
      hvacAge: 12,
      hvacType: "furnace",
      waterHeaterType: "tank_electric",
      roofCondition: "good",
      electricalPanelAmps: 150,
      efficiencyScore: 45,
      upgradePlan: JSON.stringify([
        { category: "insulation", priority: 1, needed: true, notes: "Current: fair — attic needs improvement" },
        { category: "air_sealing", priority: 2, needed: true, notes: "Standard weatherization" },
        { category: "doors", priority: 3, needed: true, notes: "Exterior door assessment" },
        { category: "windows", priority: 4, needed: true, notes: "Current: single pane" },
        { category: "hvac", priority: 5, needed: true, notes: "Age: 12 years, approaching replacement" },
        { category: "water_heating", priority: 6, needed: true, notes: "Current: tank_electric — inefficient" },
        { category: "electrical_panel", priority: 7, needed: true, notes: "Current: 150A (upgrade to 200A)" },
        { category: "solar", priority: 8, needed: true, notes: "Solar installation — roof is good" },
      ]),
      totalEstimatedCost: 38200,
      projectedSavingsKwh: 6800,
      projectedSavingsDollars: 1088,
      projectedCo2Reduction: 2.84,
      assessedBy: admin.id,
      assessorNotes: "Late 70s home in decent shape. Insulation is fair but could be better. Single-pane windows are the biggest loss. Roof is in good condition — no reinforcement needed for solar.",
    },
  });

  // Demo's phases
  await prisma.efficiencyPhase.create({
    data: {
      homeId: demoHome.id,
      phaseNumber: 1,
      phaseName: "envelope",
      categories: JSON.stringify(["insulation", "air_sealing", "doors"]),
      estimatedCost: 7200,
      status: "pending",
    },
  });

  await prisma.efficiencyPhase.create({
    data: {
      homeId: demoHome.id,
      phaseNumber: 2,
      phaseName: "openings",
      categories: JSON.stringify(["windows"]),
      estimatedCost: 10500,
      status: "pending",
    },
  });

  await prisma.efficiencyPhase.create({
    data: {
      homeId: demoHome.id,
      phaseNumber: 3,
      phaseName: "systems",
      categories: JSON.stringify(["hvac", "water_heating"]),
      estimatedCost: 11200,
      status: "pending",
    },
  });

  await prisma.efficiencyPhase.create({
    data: {
      homeId: demoHome.id,
      phaseNumber: 4,
      phaseName: "electrical",
      categories: JSON.stringify(["electrical_panel"]),
      estimatedCost: 2800,
      status: "pending",
    },
  });

  await prisma.efficiencyPhase.create({
    data: {
      homeId: demoHome.id,
      phaseNumber: 5,
      phaseName: "generation",
      categories: JSON.stringify(["solar"]),
      estimatedCost: 22000,
      status: "pending",
    },
  });

  // 4. A completed home (Angela's second — shows platform stats)
  const completedHome = await prisma.efficiencyHome.create({
    data: {
      userId: angela.id,
      address: "1190 S Vista Avenue",
      city: "Boise",
      state: "ID",
      zipCode: "83705",
      homeType: "single_family",
      yearBuilt: 1955,
      squareFootage: 1200,
      ownershipStatus: "owner",
      entryTrack: "individual",
      status: "completed",
      currentEnergyBill: 195,
      energyScoreBefore: 28,
      energyScoreAfter: 87,
      roofOrientation: "south",
      shadingFactor: "none",
      solarCapacityKw: 5.2,
      solarGenerationKwh: 7800,
      assessedAt: new Date(Date.now() - 120 * 86400000),
      completedAt: new Date(Date.now() - 14 * 86400000),
    },
  });

  await prisma.efficiencyAssessment.create({
    data: {
      homeId: completedHome.id,
      insulationCondition: "none",
      windowType: "single",
      hvacAge: 22,
      hvacType: "furnace",
      waterHeaterType: "tank_electric",
      roofCondition: "fair",
      electricalPanelAmps: 60,
      efficiencyScore: 28,
      upgradePlan: JSON.stringify([
        { category: "insulation", priority: 1, needed: true, notes: "No existing insulation" },
        { category: "air_sealing", priority: 2, needed: true, notes: "Major air leaks throughout" },
        { category: "doors", priority: 3, needed: true, notes: "Original 1955 doors" },
        { category: "windows", priority: 4, needed: true, notes: "Single pane, many cracked" },
        { category: "hvac", priority: 5, needed: true, notes: "22-year-old furnace, failing" },
        { category: "water_heating", priority: 6, needed: true, notes: "Electric tank, inefficient" },
        { category: "electrical_panel", priority: 7, needed: true, notes: "60A — dangerously undersized" },
        { category: "roof_reinforcement", priority: 8, needed: true, notes: "Needs reinforcement for solar" },
        { category: "solar", priority: 9, needed: true, notes: "Excellent south exposure, no shading" },
      ]),
      totalEstimatedCost: 48000,
      projectedSavingsKwh: 9500,
      projectedSavingsDollars: 1520,
      projectedCo2Reduction: 3.96,
      assessedBy: admin.id,
      assessorNotes: "Worst condition home assessed so far — 1955 with zero upgrades ever. Complete gut renovation needed. Fully funded through reserve as low-income eligible.",
    },
  });

  // Completed home's phases — all done
  for (const phase of [
    { num: 1, name: "envelope", cats: ["insulation", "air_sealing", "doors"], est: 8500, actual: 9200 },
    { num: 2, name: "openings", cats: ["windows"], est: 11000, actual: 10400 },
    { num: 3, name: "systems", cats: ["hvac", "water_heating"], est: 13500, actual: 14100 },
    { num: 4, name: "electrical", cats: ["electrical_panel"], est: 4200, actual: 4200 },
    { num: 5, name: "generation", cats: ["roof_reinforcement", "solar"], est: 26000, actual: 25800 },
  ]) {
    await prisma.efficiencyPhase.create({
      data: {
        homeId: completedHome.id,
        phaseNumber: phase.num,
        phaseName: phase.name,
        categories: JSON.stringify(phase.cats),
        estimatedCost: phase.est,
        actualCost: phase.actual,
        amountFunded: phase.actual,
        fundingComplete: true,
        fundingTrack: "fully_funded",
        status: "verified",
        contractorName: "Treasure Valley Efficiency Partners",
        verifiedBy: admin.id,
        verifiedAt: new Date(Date.now() - (20 - phase.num * 3) * 86400000),
        startedAt: new Date(Date.now() - (90 - phase.num * 15) * 86400000),
        completedAt: new Date(Date.now() - (25 - phase.num * 3) * 86400000),
        gapAmount: phase.actual > phase.est ? phase.actual - phase.est : null,
        gapFunded: phase.actual > phase.est ? phase.actual - phase.est : 0,
      },
    });
  }

  // 5. Community nomination (DeAndre nominates a neighbor)
  await prisma.efficiencyNomination.create({
    data: {
      nominatorId: deandre.id,
      communityId: community1.id,
      nomineeAddress: "2901 N 15th Street",
      nomineeCity: "Boise",
      nomineeState: "ID",
      nomineeZipCode: "83702",
      nomineeReason: "Elderly neighbor on fixed income. House has no insulation, original 1958 windows, and her energy bills are over $300/month in winter. She's been a North End resident for 40 years and can't afford upgrades.",
      nomineeConsent: true,
      status: "voting",
      votingEndsAt: new Date(Date.now() + 25 * 86400000),
      approvalVotes: 1,
      totalVotes: 1,
    },
  });

  // 6. Neighborhood Cascade forming in 83702 (North End)
  const cascade = await prisma.neighborhoodCascade.create({
    data: {
      name: "North End Phase 1 Efficiency Cascade",
      zipCode: "83702",
      radiusMiles: 1.0,
      homeCount: 3,
      minHomes: 10,
      triggered: false,
      targetPhase: 1,
      totalEstimatedCost: 21000,
      status: "forming",
    },
  });

  // Link Angela's home to the cascade
  await prisma.efficiencyHome.update({
    where: { id: angelaHome.id },
    data: { neighborhoodBatchId: cascade.id },
  });

  const efficiencyHomeCount = await prisma.efficiencyHome.count();
  const efficiencyPhaseCount = await prisma.efficiencyPhase.count();

  console.log("Seed complete!");
  console.log(`  Users: ${4} (admin, angela, deandre, demo)`);
  console.log(`  Projects: ${projects.length} + 3 flagships`);
  console.log(`  Role Configs: ${roleConfigs.length}`);
  console.log(`  Aquifer: Reserve $25,000 / Pool $8,500`);
  console.log(`  Strategic Plans: 2 (1 active, 1 queued)`);
  console.log(`  Platform Reserve: $${RESERVE_INITIAL_BALANCE.toLocaleString()}`);
  console.log(`  Efficiency Homes: ${efficiencyHomeCount} (1 completed, 1 in progress, 1 assessed, 1 applied)`);
  console.log(`  Efficiency Phases: ${efficiencyPhaseCount}`);
  console.log(`  Neighborhood Cascade: 1 (forming in 83702)`);
  console.log(`  Efficiency Nomination: 1 (voting)`);
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
