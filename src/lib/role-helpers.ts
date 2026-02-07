import { prisma } from "@/lib/prisma";

export async function getUserPlatformRoles(userId: string): Promise<string[]> {
  const roles = await prisma.userRole.findMany({
    where: { userId, isActive: true },
    select: { role: true },
  });
  return roles.map((r) => r.role);
}

export async function hasPlatformRole(userId: string, role: string): Promise<boolean> {
  const existing = await prisma.userRole.findFirst({
    where: { userId, role, isActive: true },
  });
  return !!existing;
}

export async function getCommunityElectedRole(
  userId: string,
  communityId: string
): Promise<string[]> {
  const now = new Date();
  const elections = await prisma.communityElection.findMany({
    where: {
      communityId,
      status: "completed",
      winnerId: userId,
      termEnd: { gt: now },
    },
    select: { role: true },
  });
  return elections.map((e) => e.role);
}

export async function hasElectedRole(
  userId: string,
  communityId: string,
  role: string
): Promise<boolean> {
  const now = new Date();
  const election = await prisma.communityElection.findFirst({
    where: {
      communityId,
      role,
      status: "completed",
      winnerId: userId,
      termEnd: { gt: now },
    },
  });
  return !!election;
}
