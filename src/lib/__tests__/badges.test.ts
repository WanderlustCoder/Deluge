import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prismaMock } from '@/__mocks__/prisma';
import '@/__mocks__/auth';

// Mock notifications
vi.mock('@/lib/notifications', () => ({
  notifyBadgeEarned: vi.fn(() => Promise.resolve()),
}));

import { checkAndAwardBadges, updateAdStreak } from '../badges';

describe('checkAndAwardBadges', () => {
  beforeEach(() => {
    // Default: user has no badges
    prismaMock.userBadge.findMany.mockResolvedValue([]);
  });

  it('awards first_ad badge when ad count >= 1', async () => {
    prismaMock.adView.count.mockResolvedValue(1);
    (prismaMock.allocation.groupBy as any).mockResolvedValue([]);
    prismaMock.contribution.count.mockResolvedValue(0);
    prismaMock.streak.findUnique.mockResolvedValue(null);
    prismaMock.badge.findUnique.mockResolvedValue({
      id: 'badge-1', key: 'first_ad', name: 'First View', description: '', tier: 'bronze', icon: '', createdAt: new Date(),
    } as any);
    prismaMock.userBadge.create.mockResolvedValue({
      id: 'ub-1', userId: 'test-user-1', badgeId: 'badge-1', earnedAt: new Date(),
    } as any);

    const newBadges = await checkAndAwardBadges('test-user-1');
    expect(newBadges).toContain('First View');
    expect(prismaMock.userBadge.create).toHaveBeenCalled();
  });

  it('does not award already-earned badges', async () => {
    prismaMock.adView.count.mockResolvedValue(100);
    (prismaMock.allocation.groupBy as any).mockResolvedValue([]);
    prismaMock.contribution.count.mockResolvedValue(0);
    prismaMock.streak.findUnique.mockResolvedValue(null);
    prismaMock.userBadge.findMany.mockResolvedValue([
      { id: 'ub-1', userId: 'test-user-1', badgeId: 'badge-1', earnedAt: new Date(), badge: { id: 'badge-1', key: 'first_ad', name: 'First View', description: '', tier: 'bronze', icon: '', createdAt: new Date() } },
    ] as any);

    // For other qualifying badges (ads_10, ads_100), we need to mock badge.findUnique
    prismaMock.badge.findUnique.mockResolvedValue({
      id: 'badge-2', key: 'ads_10', name: 'Ad Watcher', description: '', tier: 'silver', icon: '', createdAt: new Date(),
    } as any);
    prismaMock.userBadge.create.mockResolvedValue({
      id: 'ub-2', userId: 'test-user-1', badgeId: 'badge-2', earnedAt: new Date(),
    } as any);

    const newBadges = await checkAndAwardBadges('test-user-1');
    // first_ad should not be in the result since it's already earned
    expect(newBadges).not.toContain('First View');
  });
});

describe('updateAdStreak', () => {
  it('creates a new streak if none exists', async () => {
    prismaMock.streak.findUnique.mockResolvedValue(null);
    prismaMock.streak.create.mockResolvedValue({
      id: 'streak-1', userId: 'test-user-1', type: 'ad_watch',
      currentDays: 1, longestDays: 1, lastActiveDate: new Date(), createdAt: new Date(), updatedAt: new Date(),
    } as any);

    await updateAdStreak('test-user-1');
    expect(prismaMock.streak.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'test-user-1', type: 'ad_watch', currentDays: 1 }),
      })
    );
  });

  it('increments streak for consecutive days', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    prismaMock.streak.findUnique.mockResolvedValue({
      id: 'streak-1', userId: 'test-user-1', type: 'ad_watch',
      currentDays: 5, longestDays: 5, lastActiveDate: yesterday, createdAt: new Date(), updatedAt: new Date(),
    } as any);
    prismaMock.streak.update.mockResolvedValue({} as any);

    await updateAdStreak('test-user-1');
    expect(prismaMock.streak.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ currentDays: 6, longestDays: 6 }),
      })
    );
  });

  it('resets streak for non-consecutive days', async () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(0, 0, 0, 0);

    prismaMock.streak.findUnique.mockResolvedValue({
      id: 'streak-1', userId: 'test-user-1', type: 'ad_watch',
      currentDays: 5, longestDays: 10, lastActiveDate: threeDaysAgo, createdAt: new Date(), updatedAt: new Date(),
    } as any);
    prismaMock.streak.update.mockResolvedValue({} as any);

    await updateAdStreak('test-user-1');
    expect(prismaMock.streak.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ currentDays: 1, longestDays: 10 }),
      })
    );
  });
});
