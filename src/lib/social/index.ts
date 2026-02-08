import { prisma } from '@/lib/prisma';

export type SocialProvider = 'google' | 'facebook' | 'twitter' | 'linkedin' | 'apple';
export type SharePlatform = 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'email' | 'copy';

// Get user's connected social accounts
export async function getUserSocialAccounts(userId: string) {
  return prisma.socialAccount.findMany({
    where: { userId, isConnected: true },
    orderBy: { connectedAt: 'desc' },
  });
}

// Get a specific social account
export async function getSocialAccount(userId: string, provider: SocialProvider) {
  return prisma.socialAccount.findFirst({
    where: { userId, provider, isConnected: true },
  });
}

// Connect a social account
export async function connectSocialAccount(
  userId: string,
  provider: SocialProvider,
  data: {
    providerId: string;
    email?: string;
    name?: string;
    profileUrl?: string;
    avatarUrl?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiry?: Date;
    scope?: string[];
  }
) {
  return prisma.socialAccount.upsert({
    where: {
      provider_providerId: {
        provider,
        providerId: data.providerId,
      },
    },
    create: {
      userId,
      provider,
      providerId: data.providerId,
      email: data.email,
      name: data.name,
      profileUrl: data.profileUrl,
      avatarUrl: data.avatarUrl,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      tokenExpiry: data.tokenExpiry,
      scope: data.scope ? JSON.stringify(data.scope) : null,
      isConnected: true,
    },
    update: {
      userId,
      email: data.email,
      name: data.name,
      profileUrl: data.profileUrl,
      avatarUrl: data.avatarUrl,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      tokenExpiry: data.tokenExpiry,
      scope: data.scope ? JSON.stringify(data.scope) : undefined,
      isConnected: true,
      lastSyncAt: new Date(),
    },
  });
}

// Disconnect a social account
export async function disconnectSocialAccount(userId: string, provider: SocialProvider) {
  return prisma.socialAccount.updateMany({
    where: { userId, provider },
    data: { isConnected: false },
  });
}

// Provider display info
export const SOCIAL_PROVIDERS: Record<
  SocialProvider,
  { name: string; icon: string; color: string }
> = {
  google: { name: 'Google', icon: '\u{1F310}', color: '#4285F4' },
  facebook: { name: 'Facebook', icon: '\u{1F4D8}', color: '#1877F2' },
  twitter: { name: 'X (Twitter)', icon: '\u{1D54F}', color: '#000000' },
  linkedin: { name: 'LinkedIn', icon: '\u{1F4BC}', color: '#0A66C2' },
  apple: { name: 'Apple', icon: '\u{1F34E}', color: '#000000' },
};

// Share platform info
export const SHARE_PLATFORMS: Record<
  SharePlatform,
  { name: string; icon: string; color: string }
> = {
  twitter: { name: 'X', icon: '\u{1D54F}', color: '#000000' },
  facebook: { name: 'Facebook', icon: '\u{1F4D8}', color: '#1877F2' },
  linkedin: { name: 'LinkedIn', icon: '\u{1F4BC}', color: '#0A66C2' },
  whatsapp: { name: 'WhatsApp', icon: '\u{1F4AC}', color: '#25D366' },
  email: { name: 'Email', icon: '\u{2709}\uFE0F', color: '#EA4335' },
  copy: { name: 'Copy Link', icon: '\u{1F517}', color: '#6B7280' },
};
