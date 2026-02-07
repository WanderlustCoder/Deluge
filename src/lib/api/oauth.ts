// OAuth 2.0 provider implementation

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export type OAuthScope = 'profile' | 'email' | 'read' | 'write';

export interface OAuthAppRequest {
  userId: string;
  name: string;
  description: string;
  websiteUrl?: string;
  redirectUris: string[];
  scopes: OAuthScope[];
}

// Generate OAuth client credentials
function generateClientId(): string {
  return `deluge_${crypto.randomBytes(16).toString('hex')}`;
}

function generateClientSecret(): string {
  return crypto.randomBytes(32).toString('base64url');
}

function hashSecret(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

// Create a new OAuth app
export async function createOAuthApp(request: OAuthAppRequest) {
  const clientId = generateClientId();
  const clientSecret = generateClientSecret();
  const secretHash = hashSecret(clientSecret);

  const app = await prisma.oAuthApp.create({
    data: {
      userId: request.userId,
      name: request.name,
      description: request.description,
      websiteUrl: request.websiteUrl,
      clientId,
      clientSecretHash: secretHash,
      redirectUris: request.redirectUris.join(','),
      scopes: request.scopes.join(','),
      status: 'active',
    },
  });

  return {
    ...app,
    clientSecret, // Only returned on creation
  };
}

// Get user's OAuth apps
export async function getUserOAuthApps(userId: string) {
  return prisma.oAuthApp.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      description: true,
      websiteUrl: true,
      clientId: true,
      redirectUris: true,
      scopes: true,
      status: true,
      createdAt: true,
      _count: {
        select: { authorizations: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Get OAuth app by client ID
export async function getOAuthAppByClientId(clientId: string) {
  return prisma.oAuthApp.findUnique({
    where: { clientId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

// Validate client credentials
export async function validateClientCredentials(
  clientId: string,
  clientSecret: string
): Promise<boolean> {
  const app = await prisma.oAuthApp.findUnique({
    where: { clientId },
  });

  if (!app || app.status !== 'active') return false;

  const secretHash = hashSecret(clientSecret);
  return app.clientSecretHash === secretHash;
}

// Generate authorization code
export function generateAuthCode(): string {
  return crypto.randomBytes(32).toString('base64url');
}

// Create authorization
export async function createAuthorization(
  appId: string,
  userId: string,
  scopes: string[]
) {
  const authCode = generateAuthCode();
  const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const auth = await prisma.oAuthAuthorization.create({
    data: {
      appId,
      userId,
      scopes: scopes.join(','),
      authCode,
      codeExpiresAt,
    },
  });

  return { authCode, expiresAt: codeExpiresAt };
}

// Exchange auth code for tokens
export async function exchangeAuthCode(
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string
) {
  // Validate client
  const isValid = await validateClientCredentials(clientId, clientSecret);
  if (!isValid) {
    throw new Error('Invalid client credentials');
  }

  const app = await getOAuthAppByClientId(clientId);
  if (!app) {
    throw new Error('App not found');
  }

  // Validate redirect URI
  const validRedirects = app.redirectUris.split(',');
  if (!validRedirects.includes(redirectUri)) {
    throw new Error('Invalid redirect URI');
  }

  // Find and validate authorization
  const auth = await prisma.oAuthAuthorization.findFirst({
    where: {
      authCode: code,
      appId: app.id,
      codeExpiresAt: { gt: new Date() },
    },
  });

  if (!auth) {
    throw new Error('Invalid or expired authorization code');
  }

  // Generate tokens
  const accessToken = crypto.randomBytes(32).toString('base64url');
  const refreshToken = crypto.randomBytes(32).toString('base64url');
  const accessTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  const refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  // Update authorization with tokens
  await prisma.oAuthAuthorization.update({
    where: { id: auth.id },
    data: {
      accessToken: hashSecret(accessToken),
      refreshToken: hashSecret(refreshToken),
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      authCode: null,
      codeExpiresAt: null,
    },
  });

  return {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: refreshToken,
    scope: auth.scopes,
  };
}

// Validate access token
export async function validateAccessToken(token: string) {
  const tokenHash = hashSecret(token);

  const auth = await prisma.oAuthAuthorization.findFirst({
    where: {
      accessToken: tokenHash,
      accessTokenExpiresAt: { gt: new Date() },
      revokedAt: null,
    },
    include: {
      user: {
        select: { id: true, email: true, name: true, accountType: true },
      },
      app: {
        select: { id: true, name: true, clientId: true },
      },
    },
  });

  return auth;
}

// Refresh access token
export async function refreshAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
) {
  const isValid = await validateClientCredentials(clientId, clientSecret);
  if (!isValid) {
    throw new Error('Invalid client credentials');
  }

  const tokenHash = hashSecret(refreshToken);

  const auth = await prisma.oAuthAuthorization.findFirst({
    where: {
      refreshToken: tokenHash,
      refreshTokenExpiresAt: { gt: new Date() },
      revokedAt: null,
    },
  });

  if (!auth) {
    throw new Error('Invalid or expired refresh token');
  }

  // Generate new tokens
  const newAccessToken = crypto.randomBytes(32).toString('base64url');
  const newRefreshToken = crypto.randomBytes(32).toString('base64url');
  const accessTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.oAuthAuthorization.update({
    where: { id: auth.id },
    data: {
      accessToken: hashSecret(newAccessToken),
      refreshToken: hashSecret(newRefreshToken),
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    },
  });

  return {
    access_token: newAccessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: newRefreshToken,
    scope: auth.scopes,
  };
}

// Revoke authorization
export async function revokeAuthorization(authId: string, userId: string) {
  const auth = await prisma.oAuthAuthorization.findFirst({
    where: { id: authId, userId },
  });

  if (!auth) {
    throw new Error('Authorization not found');
  }

  return prisma.oAuthAuthorization.update({
    where: { id: authId },
    data: { revokedAt: new Date() },
  });
}

// Get user's authorized apps
export async function getUserAuthorizations(userId: string) {
  return prisma.oAuthAuthorization.findMany({
    where: {
      userId,
      revokedAt: null,
    },
    include: {
      app: {
        select: {
          id: true,
          name: true,
          description: true,
          websiteUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Regenerate client secret
export async function regenerateClientSecret(appId: string, userId: string) {
  const app = await prisma.oAuthApp.findFirst({
    where: { id: appId, userId },
  });

  if (!app) {
    throw new Error('OAuth app not found');
  }

  const newSecret = generateClientSecret();
  const secretHash = hashSecret(newSecret);

  await prisma.oAuthApp.update({
    where: { id: appId },
    data: { clientSecretHash: secretHash },
  });

  // Revoke all existing authorizations
  await prisma.oAuthAuthorization.updateMany({
    where: { appId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  return newSecret;
}
