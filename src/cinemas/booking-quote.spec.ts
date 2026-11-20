import { describe, expect, it } from 'vitest';
import { computeBookingQuote } from './booking-quote.js';

describe('computeBookingQuote', () => {
  it('solves [1, 3, 4] for groupSize 6 -> 2 bundles: 3 x 2 (beats greedy 4 + 1 + 1)', () => {
    const result = computeBookingQuote([1, 3, 4], 6);

    expect(result.possible).toBe(true);
    expect(result.totalBundles).toBe(2);
    expect(result.bundles).toEqual([{ size: 3, count: 2 }]);
  });

  it('solves [2, 5] for groupSize 11 -> 4 bundles: 5 x 1, 2 x 3', () => {
    const result = computeBookingQuote([2, 5], 11);

    expect(result.possible).toBe(true);
    expect(result.totalBundles).toBe(4);
    expect(result.bundles).toEqual([
      { size: 5, count: 1 },
      { size: 2, count: 3 },
    ]);
  });

  it('solves [6, 9, 20] for groupSize 44 -> 4 bundles: 20 x 1, 9 x 2, 6 x 1', () => {
    const result = computeBookingQuote([6, 9, 20], 44);

    expect(result.possible).toBe(true);
    expect(result.totalBundles).toBe(4);
    expect(result.bundles).toEqual([
      { size: 20, count: 1 },
      { size: 9, count: 2 },
      { size: 6, count: 1 },
    ]);
  });

  it('returns possible: false for [4, 6] with groupSize 7', () => {
    const result = computeBookingQuote([4, 6], 7);

    expect(result.possible).toBe(false);
    expect(result.totalBundles).toBe(0);
    expect(result.bundles).toEqual([]);
  });

  it('handles maximum groupSize of 10,000 efficiently', () => {
    const result = computeBookingQuote([7, 13, 500], 10000);

    expect(result.possible).toBe(true);
    expect(result.totalBundles).toBe(20);
    expect(result.bundles).toEqual([{ size: 500, count: 20 }]);
  });
});
