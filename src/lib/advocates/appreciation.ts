import { prisma } from '@/lib/prisma';

export type AppreciationType = 'thank_you' | 'highlight' | 'invite' | 'swag';

export const APPRECIATION_TYPES: { value: AppreciationType; label: string; description: string }[] = [
  { value: 'thank_you', label: 'Thank You Note', description: 'Personal gratitude message' },
  { value: 'highlight', label: 'Newsletter Highlight', description: 'Featured in community newsletter' },
  { value: 'invite', label: 'Special Invite', description: 'Invitation to advocate gathering' },
  { value: 'swag', label: 'Deluge Swag', description: 'Gift of merchandise' },
];

// Send appreciation to an advocate (genuine, not transactional)
export async function sendAppreciation(
  advocateId: string,
  data: {
    type: AppreciationType;
    message?: string;
    sentBy: string;
  }
) {
  return prisma.advocateAppreciation.create({
    data: {
      advocateId,
      type: data.type,
      message: data.message,
      sentBy: data.sentBy,
    },
  });
}

// Get appreciation history for an advocate
export async function getAppreciationHistory(advocateId: string) {
  return prisma.advocateAppreciation.findMany({
    where: { advocateId },
    orderBy: { sentAt: 'desc' },
  });
}

// Get recent appreciations (admin view)
export async function getRecentAppreciations(limit = 20) {
  return prisma.advocateAppreciation.findMany({
    orderBy: { sentAt: 'desc' },
    take: limit,
  });
}
