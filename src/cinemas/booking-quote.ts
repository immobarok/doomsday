export interface BookingQuote {
  possible: boolean;
  groupSize: number;
  totalBundles: number;
  bundles: { size: number; count: number }[];
  message?: string;
}

export function computeBookingQuote(
  bundleSizes: number[],
  groupSize: number,
): BookingQuote {
  const sizes = [...new Set(bundleSizes)].sort((a, b) => b - a);
  const minBundles: number[] = Array.from(
    { length: groupSize + 1 },
    () => Infinity,
  );
  const lastBundle: number[] = Array.from({ length: groupSize + 1 }, () => 0);
  minBundles[0] = 0;

  for (let seats = 1; seats <= groupSize; seats++) {
    for (const size of sizes) {
      if (size <= seats && minBundles[seats - size] + 1 < minBundles[seats]) {
        minBundles[seats] = minBundles[seats - size] + 1;
        lastBundle[seats] = size;
      }
    }
  }

  if (groupSize < 1 || minBundles[groupSize] === Infinity) {
    return {
      possible: false,
      groupSize,
      totalBundles: 0,
      bundles: [],
      message:
        'Not possible: no combination of bundles adds up to exactly this group size.',
    };
  }

  const counts = new Map<number, number>();
  for (let seats = groupSize; seats > 0; seats -= lastBundle[seats]) {
    const size = lastBundle[seats];
    counts.set(size, (counts.get(size) ?? 0) + 1);
  }

  return {
    possible: true,
    groupSize,
    totalBundles: minBundles[groupSize],
    bundles: [...counts]
      .map(([size, count]) => ({ size, count }))
      .sort((a, b) => b.size - a.size),
  };
}
