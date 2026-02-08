/**
 * AI Content Moderation
 * Plan 28: AI-Powered Platform Features
 *
 * Automated content screening for spam, inappropriate content, and fraud.
 */

import { prisma } from '@/lib/prisma';

export type ContentType = 'project' | 'comment' | 'story' | 'loan' | 'discussion';
export type FlagType = 'spam' | 'inappropriate' | 'fraud_risk' | 'off_topic' | 'duplicate';

export interface ModerationResult {
  shouldFlag: boolean;
  flagType?: FlagType;
  confidence: number;
  reason?: string;
  details?: Record<string, unknown>;
}

// Keywords that indicate potential issues
const SPAM_PATTERNS = [
  /\b(buy now|click here|limited offer|act now|free money)\b/gi,
  /\b(bitcoin|crypto|forex|trading signals)\b/gi,
  /\b(make \$\d+ in|earn \$\d+|guaranteed income)\b/gi,
  /(http[s]?:\/\/[^\s]+){3,}/g, // Multiple URLs
];

const INAPPROPRIATE_PATTERNS = [
  /\b(hate|violent|racist|sexist)\b/gi,
  // Add more patterns as needed
];

/**
 * Analyze text content for moderation issues
 */
export function analyzeContent(text: string): ModerationResult {
  const normalizedText = text.toLowerCase();

  // Check for spam patterns
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      return {
        shouldFlag: true,
        flagType: 'spam',
        confidence: 0.85,
        reason: 'Content matches spam patterns',
        details: { matchedPattern: pattern.source },
      };
    }
  }

  // Check for inappropriate content
  for (const pattern of INAPPROPRIATE_PATTERNS) {
    if (pattern.test(text)) {
      return {
        shouldFlag: true,
        flagType: 'inappropriate',
        confidence: 0.7,
        reason: 'Content may contain inappropriate language',
        details: { matchedPattern: pattern.source },
      };
    }
  }

  // Check for excessive caps (shouting)
  const capsRatio = (text.match(/[A-Z]/g)?.length || 0) / Math.max(text.length, 1);
  if (capsRatio > 0.5 && text.length > 50) {
    return {
      shouldFlag: true,
      flagType: 'spam',
      confidence: 0.6,
      reason: 'Excessive use of capital letters',
      details: { capsRatio },
    };
  }

  // Check for suspicious funding amounts (fraud risk)
  const suspiciousAmounts = normalizedText.match(/\$\d{6,}/g);
  if (suspiciousAmounts) {
    return {
      shouldFlag: true,
      flagType: 'fraud_risk',
      confidence: 0.5,
      reason: 'Unusually large funding amount mentioned',
      details: { amounts: suspiciousAmounts },
    };
  }

  return {
    shouldFlag: false,
    confidence: 0.9,
  };
}

/**
 * Flag content for review
 */
export async function flagContent(
  contentType: ContentType,
  contentId: string,
  result: ModerationResult
): Promise<{ id: string } | null> {
  if (!result.shouldFlag || !result.flagType) {
    return null;
  }

  const existing = await prisma.contentFlag.findFirst({
    where: {
      contentType,
      contentId,
      flagType: result.flagType,
      status: 'pending',
    },
  });

  if (existing) {
    return { id: existing.id };
  }

  const flag = await prisma.contentFlag.create({
    data: {
      contentType,
      contentId,
      flagType: result.flagType,
      confidence: result.confidence,
      reason: result.reason,
      details: JSON.stringify(result.details || {}),
      status: 'pending',
    },
    select: { id: true },
  });

  return flag;
}

/**
 * Screen content and flag if necessary
 */
export async function screenContent(
  contentType: ContentType,
  contentId: string,
  text: string
): Promise<ModerationResult & { flagId?: string }> {
  const result = analyzeContent(text);

  if (result.shouldFlag) {
    const flag = await flagContent(contentType, contentId, result);
    return { ...result, flagId: flag?.id };
  }

  return result;
}

/**
 * Review a flag (admin action)
 */
export async function reviewFlag(
  flagId: string,
  reviewerId: string,
  decision: 'dismiss' | 'action',
  action?: string
): Promise<boolean> {
  const result = await prisma.contentFlag.update({
    where: { id: flagId },
    data: {
      status: decision === 'dismiss' ? 'dismissed' : 'actioned',
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      action: action || null,
    },
  });

  return !!result;
}

/**
 * Get pending flags for review
 */
export async function getPendingFlags(options?: {
  flagType?: FlagType;
  contentType?: ContentType;
  limit?: number;
}): Promise<
  Array<{
    id: string;
    contentType: string;
    contentId: string;
    flagType: string;
    confidence: number;
    reason: string | null;
    createdAt: Date;
  }>
> {
  return prisma.contentFlag.findMany({
    where: {
      status: 'pending',
      flagType: options?.flagType,
      contentType: options?.contentType,
    },
    orderBy: [
      { confidence: 'desc' },
      { createdAt: 'asc' },
    ],
    take: options?.limit || 50,
    select: {
      id: true,
      contentType: true,
      contentId: true,
      flagType: true,
      confidence: true,
      reason: true,
      createdAt: true,
    },
  });
}

/**
 * Get moderation statistics
 */
export async function getModerationStats(): Promise<{
  pending: number;
  reviewedToday: number;
  dismissed: number;
  actioned: number;
  byType: Record<string, number>;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [pending, reviewedToday, dismissed, actioned, byType] = await Promise.all([
    prisma.contentFlag.count({ where: { status: 'pending' } }),
    prisma.contentFlag.count({
      where: { reviewedAt: { gte: today }, status: { not: 'pending' } },
    }),
    prisma.contentFlag.count({ where: { status: 'dismissed' } }),
    prisma.contentFlag.count({ where: { status: 'actioned' } }),
    prisma.contentFlag.groupBy({
      by: ['flagType'],
      where: { status: 'pending' },
      _count: true,
    }),
  ]);

  return {
    pending,
    reviewedToday,
    dismissed,
    actioned,
    byType: Object.fromEntries(
      byType.map((g) => [g.flagType, g._count])
    ),
  };
}
