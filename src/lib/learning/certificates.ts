// Learning Certificates
// Optional, available upon request - no "incomplete" status

import { prisma } from '@/lib/prisma';

export const CERTIFICATE_TOPICS = [
  {
    id: 'effective-giving',
    title: 'Effective Giving Fundamentals',
    description: 'Understanding impact, choosing causes, and giving strategies',
  },
  {
    id: 'financial-wellness',
    title: 'Financial Wellness for Giving',
    description: 'Budgeting for giving, tax benefits, and sustainable philanthropy',
  },
  {
    id: 'community-impact',
    title: 'Community Impact',
    description: 'Local organizing, collective action, and mutual aid',
  },
  {
    id: 'measuring-outcomes',
    title: 'Measuring Outcomes',
    description: 'Understanding how projects create and measure change',
  },
];

// Get user's certificates
export async function getUserCertificates(userId: string) {
  return prisma.learningCertificate.findMany({
    where: { userId },
    orderBy: { issuedAt: 'desc' },
  });
}

// Check if user has certificate for topic
export async function hasCertificate(userId: string, topic: string) {
  const certificate = await prisma.learningCertificate.findFirst({
    where: { userId, topic },
  });
  return !!certificate;
}

// Request a certificate
export async function requestCertificate(userId: string, topic: string) {
  // Check if topic is valid
  const topicInfo = CERTIFICATE_TOPICS.find((t) => t.id === topic);
  if (!topicInfo) {
    throw new Error('Invalid certificate topic');
  }

  // Check if already has certificate
  const existing = await prisma.learningCertificate.findFirst({
    where: { userId, topic },
  });

  if (existing) {
    return existing;
  }

  // Issue certificate
  const certificate = await prisma.learningCertificate.create({
    data: {
      userId,
      topic: topicInfo.title,
    },
  });

  return certificate;
}

// Get available certificates for user (topics they don't have yet)
export async function getAvailableCertificates(userId: string) {
  const existing = await prisma.learningCertificate.findMany({
    where: { userId },
    select: { topic: true },
  });

  const existingTopics = new Set(existing.map((c) => c.topic));

  return CERTIFICATE_TOPICS.filter((t) => !existingTopics.has(t.title));
}

// Generate certificate PDF data
export function generateCertificateData(
  certificate: {
    topic: string;
    issuedAt: Date;
  },
  userName: string
) {
  return {
    title: 'Certificate of Learning',
    topic: certificate.topic,
    recipientName: userName,
    issuedDate: certificate.issuedAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    organizationName: 'Deluge',
    tagline: 'Community-Driven Giving Platform',
  };
}
