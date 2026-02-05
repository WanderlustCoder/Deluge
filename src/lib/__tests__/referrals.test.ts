import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prismaMock } from '@/__mocks__/prisma';
import '@/__mocks__/auth';
import { checkFirstActionReferral } from '../referrals';

describe('checkFirstActionReferral', () => {
  beforeEach(() => {
    prismaMock.$transaction.mockImplementation((ops: any) => Promise.resolve(ops));
  });

  it('does nothing if user has no referral', async () => {
    prismaMock.referral.findFirst.mockResolvedValue(null);
    await checkFirstActionReferral('user-1');
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('does nothing if ad threshold not met', async () => {
    prismaMock.referral.findFirst.mockResolvedValue({
      id: 'ref-1', referrerId: 'referrer-1', referredId: 'user-1', code: 'ABC',
      status: 'signed_up', signupCredit: 0.5, actionCredit: 0, retentionCredit: 0,
      retentionCheckedAt: null, createdAt: new Date(), activatedAt: null,
    } as any);
    prismaMock.adView.count.mockResolvedValue(3); // below threshold of 5
    prismaMock.contribution.aggregate.mockResolvedValue({ _sum: { amount: 0 }, _count: 0, _avg: { amount: 0 }, _min: { amount: 0 }, _max: { amount: 0 } } as any);

    await checkFirstActionReferral('user-1');
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('credits referrer when ad threshold met', async () => {
    prismaMock.referral.findFirst.mockResolvedValue({
      id: 'ref-1', referrerId: 'referrer-1', referredId: 'user-1', code: 'ABC',
      status: 'signed_up', signupCredit: 0.5, actionCredit: 0, retentionCredit: 0,
      retentionCheckedAt: null, createdAt: new Date(), activatedAt: null,
    } as any);
    prismaMock.adView.count.mockResolvedValue(5);
    prismaMock.contribution.aggregate.mockResolvedValue({ _sum: { amount: 0 }, _count: 0, _avg: { amount: 0 }, _min: { amount: 0 }, _max: { amount: 0 } } as any);
    prismaMock.watershed.findUnique.mockResolvedValue({
      id: 'ws-1', userId: 'referrer-1', balance: 10, totalInflow: 10, totalOutflow: 0, createdAt: new Date(), updatedAt: new Date(),
    } as any);

    await checkFirstActionReferral('user-1');
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });
});
