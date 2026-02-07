import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

const NOMINATION_HOURS = 48;
const VOTING_DAYS = 7;
const TERM_YEARS = 1;
const MIN_VOTE_THRESHOLD = 0.25; // 25% of members must vote for winner

export async function startElection(
  communityId: string,
  role: string,
  startedBy: string
) {
  const now = new Date();
  const nominationEnd = new Date(now.getTime() + NOMINATION_HOURS * 60 * 60 * 1000);
  const votingEnd = new Date(nominationEnd.getTime() + VOTING_DAYS * 24 * 60 * 60 * 1000);
  const termEnd = new Date(votingEnd.getTime() + TERM_YEARS * 365 * 24 * 60 * 60 * 1000);

  // Check for active election for this role
  const existing = await prisma.communityElection.findFirst({
    where: {
      communityId,
      role,
      status: { in: ["nominating", "voting"] },
    },
  });

  if (existing) {
    throw new Error("An election for this role is already in progress");
  }

  const election = await prisma.communityElection.create({
    data: {
      communityId,
      role,
      nominationEnd,
      votingEnd,
      termEnd,
    },
  });

  return election;
}

export async function nominate(
  electionId: string,
  nomineeId: string,
  nominatedBy: string
) {
  const election = await prisma.communityElection.findUnique({
    where: { id: electionId },
  });

  if (!election || election.status !== "nominating") {
    throw new Error("Election is not in nomination phase");
  }

  if (new Date() > election.nominationEnd) {
    // Transition to voting
    await prisma.communityElection.update({
      where: { id: electionId },
      data: { status: "voting" },
    });
    throw new Error("Nomination period has ended");
  }

  // Verify both nominee and nominator are community members
  const [nomineeIsMember, nominatorIsMember] = await Promise.all([
    prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: election.communityId, userId: nomineeId } },
    }),
    prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: election.communityId, userId: nominatedBy } },
    }),
  ]);

  if (!nomineeIsMember) throw new Error("Nominee must be a community member");
  if (!nominatorIsMember) throw new Error("Only community members can nominate");

  await prisma.electionNomination.create({
    data: { electionId, nomineeId, nominatedBy },
  });

  // Notify nominee
  createNotification(
    nomineeId,
    "election_nomination",
    "You've Been Nominated!",
    `You've been nominated for the ${election.role} role.`,
    { link: `/communities/${election.communityId}` }
  ).catch(() => {});
}

export async function castVote(
  electionId: string,
  voterId: string,
  nomineeId: string
) {
  const election = await prisma.communityElection.findUnique({
    where: { id: electionId },
    include: { nominations: true },
  });

  if (!election) throw new Error("Election not found");

  // Auto-transition from nominating to voting if past nominationEnd
  if (election.status === "nominating" && new Date() > election.nominationEnd) {
    await prisma.communityElection.update({
      where: { id: electionId },
      data: { status: "voting" },
    });
  } else if (election.status !== "voting" && election.status !== "nominating") {
    throw new Error("Election is not in voting phase");
  }

  if (new Date() > election.votingEnd) {
    throw new Error("Voting period has ended");
  }

  // Check voter is a member
  const isMember = await prisma.communityMember.findUnique({
    where: { communityId_userId: { communityId: election.communityId, userId: voterId } },
  });
  if (!isMember) throw new Error("Only community members can vote");

  // Check nominee is actually nominated
  const isNominated = election.nominations.some((n) => n.nomineeId === nomineeId);
  if (!isNominated) throw new Error("This person is not a nominee");

  await prisma.electionVote.upsert({
    where: { electionId_voterId: { electionId, voterId } },
    update: { nomineeId },
    create: { electionId, voterId, nomineeId },
  });
}

export async function finalizeElection(
  electionId: string
): Promise<{ winnerId?: string; reason: string }> {
  const election = await prisma.communityElection.findUnique({
    where: { id: electionId },
    include: {
      votes: true,
      community: { select: { memberCount: true } },
    },
  });

  if (!election) throw new Error("Election not found");
  if (election.status === "completed" || election.status === "cancelled") {
    throw new Error("Election already finalized");
  }

  if (new Date() < election.votingEnd) {
    throw new Error("Voting period has not ended yet");
  }

  const votes = election.votes;
  const memberCount = election.community.memberCount;
  const minVotes = Math.ceil(memberCount * MIN_VOTE_THRESHOLD);

  if (votes.length < minVotes) {
    await prisma.communityElection.update({
      where: { id: electionId },
      data: { status: "cancelled" },
    });
    return { reason: `Not enough votes (${votes.length}/${minVotes} required)` };
  }

  // Count votes per nominee
  const voteCounts = new Map<string, number>();
  for (const vote of votes) {
    voteCounts.set(vote.nomineeId, (voteCounts.get(vote.nomineeId) || 0) + 1);
  }

  // Find winner
  let winnerId = "";
  let maxVotes = 0;
  for (const [nomineeId, count] of voteCounts) {
    if (count > maxVotes) {
      winnerId = nomineeId;
      maxVotes = count;
    }
  }

  await prisma.communityElection.update({
    where: { id: electionId },
    data: { status: "completed", winnerId },
  });

  // Notify winner
  createNotification(
    winnerId,
    "election_won",
    "Election Won!",
    `You've been elected as ${election.role}!`,
    { link: `/communities/${election.communityId}` }
  ).catch(() => {});

  return { winnerId, reason: `Won with ${maxVotes} votes` };
}

export async function checkExpiredTerms(communityId: string) {
  const now = new Date();
  const expired = await prisma.communityElection.findMany({
    where: {
      communityId,
      status: "completed",
      termEnd: { lte: now },
      winnerId: { not: null },
    },
  });

  // Mark expired elections — the roles are now vacant
  if (expired.length > 0) {
    await prisma.communityElection.updateMany({
      where: { id: { in: expired.map((e) => e.id) } },
      data: { status: "cancelled" },
    });
  }

  return expired;
}

export async function getElectedRoles(
  communityId: string
): Promise<Array<{ role: string; userId: string; termEnd: Date }>> {
  const now = new Date();
  const elections = await prisma.communityElection.findMany({
    where: {
      communityId,
      status: "completed",
      winnerId: { not: null },
      termEnd: { gt: now },
    },
  });

  return elections.map((e) => ({
    role: e.role,
    userId: e.winnerId!,
    termEnd: e.termEnd,
  }));
}
