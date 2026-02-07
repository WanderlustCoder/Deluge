// API key generation and management

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export type ApiScope = 'read' | 'write' | 'webhooks' | 'oauth';
export type ApiKeyStatus = 'active' | 'revoked' | 'expired';

export interface CreateApiKeyRequest {
  userId: string;
  name: string;
  scopes: ApiScope[];
  rateLimit?: number;
  expiresAt?: Date;
}

// Generate a new API key
export function generateApiKey(): { key: string; hash: string; prefix: string } {
  // Generate 32 random bytes and convert to base64url
  const randomBytes = crypto.randomBytes(32);
  const key = `dlg_${randomBytes.toString('base64url')}`;
  const prefix = key.substring(0, 12); // "dlg_" + 8 chars
  const hash = hashApiKey(key);

  return { key, hash, prefix };
}

// Hash an API key for storage
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

// Create a new API key
export async function createApiKey(request: CreateApiKeyRequest) {
  const { key, hash, prefix } = generateApiKey();

  const apiKey = await prisma.apiKey.create({
    data: {
      userId: request.userId,
      name: request.name,
      keyHash: hash,
      keyPrefix: prefix,
      scopes: request.scopes.join(','),
      rateLimit: request.rateLimit || 1000,
      expiresAt: request.expiresAt,
      status: 'active',
    },
  });

  // Return the full key only on creation - it won't be retrievable later
  return {
    id: apiKey.id,
    name: apiKey.name,
    key, // Only returned on creation
    prefix: apiKey.keyPrefix,
    scopes: request.scopes,
    rateLimit: apiKey.rateLimit,
    expiresAt: apiKey.expiresAt,
    createdAt: apiKey.createdAt,
  };
}

// Get API key by hash (for authentication)
export async function getApiKeyByHash(hash: string) {
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          accountType: true,
        },
      },
    },
  });

  if (!apiKey) return null;

  // Check if key is valid
  if (apiKey.status !== 'active') return null;
  if (apiKey.expiresAt && new Date() > apiKey.expiresAt) return null;

  return apiKey;
}

// Validate and get API key from header
export async function validateApiKey(authHeader: string | null) {
  if (!authHeader) return null;

  // Expect format: "Bearer dlg_xxxxx" or just "dlg_xxxxx"
  let key = authHeader;
  if (authHeader.startsWith('Bearer ')) {
    key = authHeader.substring(7);
  }

  if (!key.startsWith('dlg_')) return null;

  const hash = hashApiKey(key);
  const apiKey = await getApiKeyByHash(hash);

  if (apiKey) {
    // Update usage stats
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: {
        lastUsedAt: new Date(),
        usageCount: { increment: 1 },
      },
    });
  }

  return apiKey;
}

// Check if API key has required scope
export function hasScope(apiKey: { scopes: string }, requiredScope: ApiScope): boolean {
  const scopes = apiKey.scopes.split(',') as ApiScope[];
  return scopes.includes(requiredScope) || scopes.includes('write'); // write implies read
}

// Get user's API keys
export async function getUserApiKeys(userId: string) {
  return prisma.apiKey.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      scopes: true,
      rateLimit: true,
      status: true,
      lastUsedAt: true,
      usageCount: true,
      expiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Revoke an API key
export async function revokeApiKey(keyId: string, userId: string, reason?: string) {
  const apiKey = await prisma.apiKey.findFirst({
    where: { id: keyId, userId },
  });

  if (!apiKey) {
    throw new Error('API key not found');
  }

  return prisma.apiKey.update({
    where: { id: keyId },
    data: {
      status: 'revoked',
      revokedAt: new Date(),
      revokedReason: reason,
    },
  });
}

// Log an API request
export async function logApiRequest(
  apiKeyId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime: number,
  ipAddress?: string,
  userAgent?: string
) {
  return prisma.apiRequestLog.create({
    data: {
      apiKeyId,
      endpoint,
      method,
      statusCode,
      responseTime,
      ipAddress,
      userAgent,
    },
  });
}

// Get API usage stats for a key
export async function getApiKeyStats(keyId: string, days: number = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [totalRequests, byEndpoint, byStatus] = await Promise.all([
    prisma.apiRequestLog.count({
      where: { apiKeyId: keyId, createdAt: { gte: since } },
    }),
    prisma.apiRequestLog.groupBy({
      by: ['endpoint'],
      where: { apiKeyId: keyId, createdAt: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
    prisma.apiRequestLog.groupBy({
      by: ['statusCode'],
      where: { apiKeyId: keyId, createdAt: { gte: since } },
      _count: { id: true },
    }),
  ]);

  return {
    totalRequests,
    byEndpoint: byEndpoint.map((e) => ({ endpoint: e.endpoint, count: e._count.id })),
    byStatus: byStatus.map((s) => ({ status: s.statusCode, count: s._count.id })),
  };
}
