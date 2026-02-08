import { prisma } from '@/lib/prisma';

export type ProfileVisibility = 'public' | 'community' | 'private';
export type MessagePermission = 'anyone' | 'followers' | 'none';
export type DataRetention = '1y' | '3y' | '5y' | 'indefinite';

export interface PrivacySettingsData {
  profileVisibility: ProfileVisibility;
  showGivingHistory: boolean;
  showBadges: boolean;
  showCommunities: boolean;
  allowTagging: boolean;
  allowMessages: MessagePermission;
  showOnLeaderboards: boolean;
  dataRetention: DataRetention;
}

// Get user's privacy settings
export async function getPrivacySettings(userId: string): Promise<PrivacySettingsData> {
  const settings = await prisma.privacySettings.findUnique({
    where: { userId },
  });

  if (!settings) {
    // Return defaults
    return {
      profileVisibility: 'public',
      showGivingHistory: false,
      showBadges: true,
      showCommunities: true,
      allowTagging: true,
      allowMessages: 'followers',
      showOnLeaderboards: true,
      dataRetention: 'indefinite',
    };
  }

  return {
    profileVisibility: settings.profileVisibility as ProfileVisibility,
    showGivingHistory: settings.showGivingHistory,
    showBadges: settings.showBadges,
    showCommunities: settings.showCommunities,
    allowTagging: settings.allowTagging,
    allowMessages: settings.allowMessages as MessagePermission,
    showOnLeaderboards: settings.showOnLeaderboards,
    dataRetention: settings.dataRetention as DataRetention,
  };
}

// Update user's privacy settings
export async function updatePrivacySettings(
  userId: string,
  data: Partial<PrivacySettingsData>
) {
  return prisma.privacySettings.upsert({
    where: { userId },
    create: {
      userId,
      profileVisibility: data.profileVisibility ?? 'public',
      showGivingHistory: data.showGivingHistory ?? false,
      showBadges: data.showBadges ?? true,
      showCommunities: data.showCommunities ?? true,
      allowTagging: data.allowTagging ?? true,
      allowMessages: data.allowMessages ?? 'followers',
      showOnLeaderboards: data.showOnLeaderboards ?? true,
      dataRetention: data.dataRetention ?? 'indefinite',
    },
    update: data,
  });
}

// Check if user can be tagged
export async function canBeTagged(userId: string): Promise<boolean> {
  const settings = await getPrivacySettings(userId);
  return settings.allowTagging;
}

// Check if user can receive messages from another user
export async function canReceiveMessageFrom(
  recipientId: string,
  senderId: string
): Promise<boolean> {
  const settings = await getPrivacySettings(recipientId);

  if (settings.allowMessages === 'anyone') return true;
  if (settings.allowMessages === 'none') return false;

  // Check if sender follows recipient
  const follow = await prisma.userFollow.findUnique({
    where: { followerId_followeeId: { followerId: senderId, followeeId: recipientId } },
  });

  return !!follow;
}

// Check if profile is visible to another user
export async function isProfileVisibleTo(
  profileUserId: string,
  viewerId: string | null
): Promise<boolean> {
  if (profileUserId === viewerId) return true;

  const settings = await getPrivacySettings(profileUserId);

  if (settings.profileVisibility === 'public') return true;
  if (settings.profileVisibility === 'private') return false;

  // Community visibility - check if viewer shares a community
  if (!viewerId) return false;

  const sharedCommunity = await prisma.communityMember.findFirst({
    where: {
      userId: viewerId,
      community: {
        members: {
          some: { userId: profileUserId },
        },
      },
    },
  });

  return !!sharedCommunity;
}

// Apply visibility filters to user profile data
export function applyPrivacyFilters(
  profileData: Record<string, unknown>,
  settings: PrivacySettingsData,
  isOwner: boolean
): Record<string, unknown> {
  if (isOwner) return profileData;

  const filtered = { ...profileData };

  if (!settings.showGivingHistory) {
    delete filtered.givingHistory;
    delete filtered.totalContributed;
  }

  if (!settings.showBadges) {
    delete filtered.badges;
  }

  if (!settings.showCommunities) {
    delete filtered.communities;
  }

  return filtered;
}
