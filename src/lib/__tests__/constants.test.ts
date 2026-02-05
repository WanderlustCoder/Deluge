import { describe, it, expect } from 'vitest';
import {
  calculateAdSplit,
  simulateAdRevenue,
  getCascadeStage,
  PLATFORM_CUT_PERCENTAGE,
  WATERSHED_CREDIT_PERCENTAGE,
  AD_REVENUE_RANGE,
} from '../constants';

describe('calculateAdSplit', () => {
  it('splits revenue correctly at 40/60', () => {
    const result = calculateAdSplit(0.01);
    expect(result.grossRevenue).toBe(0.01);
    expect(result.platformCut).toBeCloseTo(0.004);
    expect(result.watershedCredit).toBeCloseTo(0.006);
  });

  it('platform + watershed = gross', () => {
    const result = calculateAdSplit(0.025);
    expect(result.platformCut + result.watershedCredit).toBeCloseTo(result.grossRevenue);
  });

  it('handles zero', () => {
    const result = calculateAdSplit(0);
    expect(result.platformCut).toBe(0);
    expect(result.watershedCredit).toBe(0);
  });
});

describe('simulateAdRevenue', () => {
  it('returns values within the defined range', () => {
    for (let i = 0; i < 100; i++) {
      const result = simulateAdRevenue();
      expect(result.grossRevenue).toBeGreaterThanOrEqual(AD_REVENUE_RANGE.min);
      expect(result.grossRevenue).toBeLessThanOrEqual(AD_REVENUE_RANGE.max);
    }
  });

  it('has correct split proportions', () => {
    const result = simulateAdRevenue();
    expect(result.platformCut).toBeCloseTo(result.grossRevenue * PLATFORM_CUT_PERCENTAGE, 3);
    expect(result.watershedCredit).toBeCloseTo(result.grossRevenue * WATERSHED_CREDIT_PERCENTAGE, 3);
  });
});

describe('getCascadeStage', () => {
  it('returns Raindrop at 0%', () => {
    expect(getCascadeStage(0, 1000).name).toBe('Raindrop');
  });

  it('returns Stream at 10%', () => {
    expect(getCascadeStage(100, 1000).name).toBe('Stream');
  });

  it('returns Creek at 25%', () => {
    expect(getCascadeStage(250, 1000).name).toBe('Creek');
  });

  it('returns River at 50%', () => {
    expect(getCascadeStage(500, 1000).name).toBe('River');
  });

  it('returns Cascade at 100%', () => {
    expect(getCascadeStage(1000, 1000).name).toBe('Cascade');
  });

  it('caps progress at 1.0', () => {
    expect(getCascadeStage(1500, 1000).progress).toBe(1);
  });

  it('handles zero goal gracefully', () => {
    expect(getCascadeStage(0, 0).name).toBe('Raindrop');
    expect(getCascadeStage(0, 0).progress).toBe(0);
  });
});
