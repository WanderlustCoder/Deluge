import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import {
  AQUIFER_VOTE_DURATION_DAYS,
  AQUIFER_APPROVAL_THRESHOLD,
  AQUIFER_REACTIVATION_THRESHOLD,
} from "@/lib/constants";

// --- Strategic Plan Management ---

export async function getActiveStrategicPlan() {
  return prisma.strategicPlan.findFirst({
    where: { status: "active" },
    include: {
      flagships: {
        include: {
          project: true,
        },
      },
    },
    orderBy: { order: "asc" },
  });
}

export async function getStrategicPlans(includeArchived = false) {
  const where = includeArchived ? {} : { status: { not: "archived" } };

  return prisma.strategicPlan.findMany({
    where,
    include: {
      flagships: {
        include: {
          project: true,
        },
      },
    },
    orderBy: { order: "asc" },
  });
}

export async function getStrategicPlan(id: string) {
  return prisma.strategicPlan.findUnique({
    where: { id },
    include: {
      flagships: {
        include: {
          project: true,
          votes: true,
          sponsors: true,
        },
      },
    },
  });
}

export async function createStrategicPlan(data: {
  title: string;
  description: string;
  vision: string;
  fundingGoal: number;
}) {
  // Get the max order for queuing
  const maxOrder = await prisma.strategicPlan.aggregate({
    _max: { order: true },
  });

  return prisma.strategicPlan.create({
    data: {
      ...data,
      order: (maxOrder._max.order || 0) + 1,
      status: "active",
    },
  });
}

export async function updateStrategicPlan(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    vision: string;
    fundingGoal: number;
    status: string;
    order: number;
  }>
) {
  return prisma.strategicPlan.update({
    where: { id },
    data,
  });
}

export async function completeStrategicPlan(id: string) {
  // Mark current plan as completed, activate next in queue
  const [completed, nextPlan] = await prisma.$transaction(async (tx) => {
    const completed = await tx.strategicPlan.update({
      where: { id },
      data: { status: "completed" },
    });

    // Find next queued plan
    const next = await tx.strategicPlan.findFirst({
      where: { status: "active", id: { not: id } },
      orderBy: { order: "asc" },
    });

    return [completed, next];
  });

  return { completed, nextPlan };
}

// --- Aquifer Fund Management ---

export async function getAquifers() {
  const [reserve, pool] = await Promise.all([
    prisma.aquifer.findUnique({ where: { type: "reserve" } }),
    prisma.aquifer.findUnique({ where: { type: "pool" } }),
  ]);

  return {
    reserve: reserve || { type: "reserve", balance: 0 },
    pool: pool || { type: "pool", balance: 0 },
  };
}

export async function getAquiferWithPlan(userId?: string) {
  const [{ reserve, pool }, activePlan] = await Promise.all([
    getAquifers(),
    getActiveStrategicPlan(),
  ]);

  let userPoolContribution = 0;
  if (userId) {
    const poolAquifer = await prisma.aquifer.findUnique({
      where: { type: "pool" },
    });
    if (poolAquifer) {
      const contributions = await prisma.aquiferContribution.aggregate({
        where: { aquiferId: poolAquifer.id, userId },
        _sum: { amount: true },
      });
      userPoolContribution = contributions._sum.amount || 0;
    }
  }

  return {
    reserve: {
      ...reserve,
      // Reserve progress is measured against the active plan's goal
      fundingGoal: activePlan?.fundingGoal || 0,
      progress: activePlan?.fundingGoal
        ? Math.min(1, (reserve.balance || 0) / activePlan.fundingGoal)
        : 0,
    },
    pool: {
      ...pool,
      userContribution: userPoolContribution,
    },
    activePlan,
  };
}

export async function getAquiferWithUserContribution(userId?: string) {
  const { reserve, pool } = await getAquifers();

  let userPoolContribution = 0;
  if (userId) {
    const poolAquifer = await prisma.aquifer.findUnique({
      where: { type: "pool" },
    });
    if (poolAquifer) {
      const contributions = await prisma.aquiferContribution.aggregate({
        where: { aquiferId: poolAquifer.id, userId },
        _sum: { amount: true },
      });
      userPoolContribution = contributions._sum.amount || 0;
    }
  }

  return {
    reserve,
    pool: {
      ...pool,
      userContribution: userPoolContribution,
    },
  };
}

export async function contributeToPool(userId: string, amount: number) {
  if (amount <= 0) {
    throw new Error("Amount must be positive");
  }

  // Get user's watershed
  const watershed = await prisma.watershed.findUnique({
    where: { userId },
  });

  if (!watershed || watershed.balance < amount) {
    throw new Error("Insufficient watershed balance");
  }

  // Get or create Pool aquifer
  let pool = await prisma.aquifer.findUnique({ where: { type: "pool" } });
  if (!pool) {
    pool = await prisma.aquifer.create({
      data: { type: "pool", balance: 0 },
    });
  }

  // Transaction: debit watershed, credit pool
  const [, , contribution] = await prisma.$transaction([
    prisma.watershed.update({
      where: { id: watershed.id },
      data: {
        balance: { decrement: amount },
        totalOutflow: { increment: amount },
      },
    }),
    prisma.watershedTransaction.create({
      data: {
        watershedId: watershed.id,
        type: "aquifer_contribution",
        amount: -amount,
        description: "Contributed to Aquifer Pool",
        balanceAfter: watershed.balance - amount,
      },
    }),
    prisma.aquifer.update({
      where: { id: pool.id },
      data: { balance: { increment: amount } },
    }),
    prisma.aquiferContribution.create({
      data: {
        aquiferId: pool.id,
        userId,
        amount,
        isDeluge: false,
      },
    }),
  ]);

  return contribution;
}

export async function contributeFromDeluge(
  type: "reserve" | "pool",
  amount: number,
  note?: string
) {
  if (amount <= 0) {
    throw new Error("Amount must be positive");
  }

  // Get or create aquifer
  let aquifer = await prisma.aquifer.findUnique({ where: { type } });
  if (!aquifer) {
    aquifer = await prisma.aquifer.create({
      data: { type, balance: 0 },
    });
  }

  const [updatedAquifer, contribution] = await prisma.$transaction([
    prisma.aquifer.update({
      where: { id: aquifer.id },
      data: { balance: { increment: amount } },
    }),
    prisma.aquiferContribution.create({
      data: {
        aquiferId: aquifer.id,
        userId: null,
        amount,
        isDeluge: true,
        note,
      },
    }),
  ]);

  return { aquifer: updatedAquifer, contribution };
}

// --- Flagship Project Management ---

export async function getFlagshipProjects(status?: string) {
  const where = status ? { status } : {};

  return prisma.flagshipProject.findMany({
    where,
    include: {
      project: true,
      votes: true,
      sponsors: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
      _count: {
        select: { votes: true, sponsors: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFlagshipProject(id: string) {
  return prisma.flagshipProject.findUnique({
    where: { id },
    include: {
      project: true,
      votes: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
      sponsors: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export async function getFlagshipByProjectId(projectId: string) {
  return prisma.flagshipProject.findUnique({
    where: { projectId },
    include: {
      project: true,
      votes: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
      sponsors: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
  });
}

// --- Voting ---

export async function getVoteEligibility(userId: string): Promise<{
  eligible: boolean;
  reason?: string;
}> {
  const userRole = await prisma.userRole.findFirst({
    where: {
      userId,
      role: "verified_giver",
      isActive: true,
    },
  });

  if (!userRole) {
    return {
      eligible: false,
      reason: "Only Verified Givers can vote on Pool-funded flagship projects",
    };
  }

  return { eligible: true };
}

export async function castFlagshipVote(
  flagshipId: string,
  userId: string,
  vote: "approve" | "reject" | "table"
) {
  const flagship = await prisma.flagshipProject.findUnique({
    where: { id: flagshipId },
  });

  if (!flagship) {
    throw new Error("Flagship project not found");
  }

  if (flagship.status !== "voting") {
    throw new Error("This project is not currently in voting phase");
  }

  if (flagship.votingEndsAt && new Date() > flagship.votingEndsAt) {
    throw new Error("Voting period has ended");
  }

  // Check eligibility
  const eligibility = await getVoteEligibility(userId);
  if (!eligibility.eligible) {
    throw new Error(eligibility.reason);
  }

  // Upsert vote (user can change their vote)
  const voteRecord = await prisma.flagshipVote.upsert({
    where: {
      flagshipProjectId_userId: { flagshipProjectId: flagshipId, userId },
    },
    update: { vote },
    create: { flagshipProjectId: flagshipId, userId, vote },
  });

  return voteRecord;
}

export async function getVoteTally(flagshipId: string) {
  const votes = await prisma.flagshipVote.findMany({
    where: { flagshipProjectId: flagshipId },
  });

  const tally = {
    approve: 0,
    reject: 0,
    table: 0,
    total: votes.length,
  };

  for (const v of votes) {
    if (v.vote === "approve") tally.approve++;
    else if (v.vote === "reject") tally.reject++;
    else if (v.vote === "table") tally.table++;
  }

  return tally;
}

export async function finalizeFlagshipVote(flagshipId: string) {
  const flagship = await prisma.flagshipProject.findUnique({
    where: { id: flagshipId },
    include: { project: true },
  });

  if (!flagship) {
    throw new Error("Flagship project not found");
  }

  if (flagship.status !== "voting") {
    throw new Error("This project is not in voting phase");
  }

  if (flagship.votingEndsAt && new Date() < flagship.votingEndsAt) {
    throw new Error("Voting period has not ended yet");
  }

  const tally = await getVoteTally(flagshipId);

  if (tally.total === 0) {
    // No votes - table the project
    await prisma.flagshipProject.update({
      where: { id: flagshipId },
      data: { status: "tabled", tabledAt: new Date() },
    });
    return { status: "tabled", reason: "No votes cast" };
  }

  const approvalRate = tally.approve / tally.total;
  const tableRate = tally.table / tally.total;

  if (tableRate > 0.5) {
    // Majority voted to table
    await prisma.flagshipProject.update({
      where: { id: flagshipId },
      data: { status: "tabled", tabledAt: new Date() },
    });
    return { status: "tabled", reason: "Majority voted to table" };
  }

  if (approvalRate >= AQUIFER_APPROVAL_THRESHOLD) {
    // Approved - fund from Pool
    const pool = await prisma.aquifer.findUnique({ where: { type: "pool" } });
    const fundingNeeded =
      flagship.project.fundingGoal - flagship.project.fundingRaised;

    if (pool && pool.balance >= fundingNeeded) {
      await prisma.$transaction([
        prisma.aquifer.update({
          where: { id: pool.id },
          data: { balance: { decrement: fundingNeeded } },
        }),
        prisma.project.update({
          where: { id: flagship.projectId },
          data: {
            fundingRaised: flagship.project.fundingGoal,
            status: "funded",
          },
        }),
        prisma.flagshipProject.update({
          where: { id: flagshipId },
          data: { status: "funded" },
        }),
      ]);
      return { status: "funded", reason: `Approved with ${Math.round(approvalRate * 100)}% approval` };
    } else {
      // Not enough funds - stay in voting or partial fund
      return {
        status: "voting",
        reason: "Approved but insufficient Pool funds",
      };
    }
  }

  // Rejected
  await prisma.flagshipProject.update({
    where: { id: flagshipId },
    data: { status: "rejected" },
  });
  return {
    status: "rejected",
    reason: `Did not meet ${Math.round(AQUIFER_APPROVAL_THRESHOLD * 100)}% approval threshold`,
  };
}

// --- Sponsoring Tabled Projects ---

export async function sponsorFlagshipProject(flagshipId: string, userId: string) {
  const flagship = await prisma.flagshipProject.findUnique({
    where: { id: flagshipId },
    include: { _count: { select: { sponsors: true } } },
  });

  if (!flagship) {
    throw new Error("Flagship project not found");
  }

  if (flagship.status !== "tabled") {
    throw new Error("Only tabled projects can be sponsored");
  }

  // Check if already sponsoring
  const existing = await prisma.flagshipSponsor.findUnique({
    where: {
      flagshipProjectId_userId: { flagshipProjectId: flagshipId, userId },
    },
  });

  if (existing) {
    throw new Error("You are already sponsoring this project");
  }

  const sponsor = await prisma.flagshipSponsor.create({
    data: { flagshipProjectId: flagshipId, userId },
  });

  // Check reactivation threshold
  await checkReactivation(flagshipId);

  return sponsor;
}

export async function checkReactivation(flagshipId: string) {
  const flagship = await prisma.flagshipProject.findUnique({
    where: { id: flagshipId },
    include: { _count: { select: { sponsors: true } } },
  });

  if (!flagship || flagship.status !== "tabled") {
    return { reactivated: false };
  }

  // Get total verified givers count for threshold
  const verifiedGiversCount = await prisma.userRole.count({
    where: { role: "verified_giver", isActive: true },
  });

  const sponsorsNeeded = Math.ceil(
    verifiedGiversCount * AQUIFER_REACTIVATION_THRESHOLD
  );
  const currentSponsors = flagship._count.sponsors;

  if (currentSponsors >= sponsorsNeeded && sponsorsNeeded > 0) {
    // Reactivate - set back to voting with new deadline
    const votingEndsAt = new Date();
    votingEndsAt.setDate(votingEndsAt.getDate() + AQUIFER_VOTE_DURATION_DAYS);

    await prisma.$transaction([
      prisma.flagshipProject.update({
        where: { id: flagshipId },
        data: {
          status: "voting",
          votingEndsAt,
          tabledAt: null,
        },
      }),
      // Clear old votes for fresh voting round
      prisma.flagshipVote.deleteMany({
        where: { flagshipProjectId: flagshipId },
      }),
      // Keep sponsors but they'll need to vote again
    ]);

    return { reactivated: true, sponsorsNeeded, currentSponsors };
  }

  return {
    reactivated: false,
    sponsorsNeeded,
    currentSponsors,
    remaining: sponsorsNeeded - currentSponsors,
  };
}

// --- Creating Flagship Projects ---

export async function createFlagshipProject(
  projectData: {
    title: string;
    description: string;
    category: string;
    fundingGoal: number;
    location: string;
    imageUrl?: string;
  },
  fundingSource: "reserve" | "pool",
  strategicPlanId?: string
) {
  // Reserve-funded flagships must be tied to a strategic plan
  if (fundingSource === "reserve" && !strategicPlanId) {
    throw new Error("Reserve-funded flagships must be tied to a Strategic Plan");
  }

  // Verify the plan exists if provided
  if (strategicPlanId) {
    const plan = await prisma.strategicPlan.findUnique({
      where: { id: strategicPlanId },
    });
    if (!plan) {
      throw new Error("Strategic Plan not found");
    }
    if (plan.status !== "active") {
      throw new Error("Can only create flagships for active Strategic Plans");
    }
  }

  const votingEndsAt =
    fundingSource === "pool"
      ? new Date(Date.now() + AQUIFER_VOTE_DURATION_DAYS * 24 * 60 * 60 * 1000)
      : null;

  const status = fundingSource === "pool" ? "voting" : "active";

  const [project, flagship] = await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        ...projectData,
        isFlagship: true,
        status: "active",
      },
    });

    const flagship = await tx.flagshipProject.create({
      data: {
        projectId: project.id,
        strategicPlanId: strategicPlanId || null,
        fundingSource,
        status,
        votingEndsAt,
      },
    });

    return [project, flagship];
  });

  return { project, flagship };
}

export async function fundFromReserve(flagshipId: string, amount: number) {
  const flagship = await prisma.flagshipProject.findUnique({
    where: { id: flagshipId },
    include: { project: true },
  });

  if (!flagship) {
    throw new Error("Flagship project not found");
  }

  const reserve = await prisma.aquifer.findUnique({ where: { type: "reserve" } });

  if (!reserve || reserve.balance < amount) {
    throw new Error("Insufficient Reserve funds");
  }

  const fundingNeeded =
    flagship.project.fundingGoal - flagship.project.fundingRaised;
  const fundingAmount = Math.min(amount, fundingNeeded);

  const newRaised = flagship.project.fundingRaised + fundingAmount;
  const isFunded = newRaised >= flagship.project.fundingGoal;

  await prisma.$transaction([
    prisma.aquifer.update({
      where: { id: reserve.id },
      data: { balance: { decrement: fundingAmount } },
    }),
    prisma.project.update({
      where: { id: flagship.projectId },
      data: {
        fundingRaised: newRaised,
        status: isFunded ? "funded" : "active",
      },
    }),
    ...(isFunded
      ? [
          prisma.flagshipProject.update({
            where: { id: flagshipId },
            data: { status: "funded" },
          }),
        ]
      : []),
  ]);

  return { funded: isFunded, amountFunded: fundingAmount };
}
