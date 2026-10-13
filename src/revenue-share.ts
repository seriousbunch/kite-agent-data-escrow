export interface ContributorShare {
  annotator: string;
  labelsVerified: number;
  qualityBonusBps: number; // e.g. 500 = +5% bonus for high accuracy
}

export interface RevenueDisbursementResult {
  totalPoolWei: bigint;
  totalDistributedWei: bigint;
  platformFeeWei: bigint;
  allocations: Array<{ annotator: string; payoutWei: bigint }>;
}

/**
 * RevenueShareCalculator
 * Computes fair multi-annotator micropayment splits weighted by verified label counts and accuracy bonuses
 */
export class RevenueShareCalculator {
  private platformFeeBps: number;

  constructor(platformFeeBps: number = 300) { // 3.0% protocol treasury fee
    this.platformFeeBps = platformFeeBps;
  }

  public calculatePayouts(
    totalPoolWei: bigint,
    contributors: ContributorShare[]
  ): RevenueDisbursementResult {
    if (totalPoolWei <= 0n) {
      throw new Error("Total pool amount must be positive");
    }
    if (contributors.length === 0) {
      throw new Error("Contributors list cannot be empty");
    }

    const platformFeeWei = (totalPoolWei * BigInt(this.platformFeeBps)) / 10000n;
    const distributableWei = totalPoolWei - platformFeeWei;

    // Calculate effective weight per contributor: labelsVerified * (10000 + qualityBonusBps)
    const weights: bigint[] = contributors.map(
      (c) => BigInt(c.labelsVerified) * BigInt(10000 + c.qualityBonusBps)
    );

    const totalWeight = weights.reduce((acc, w) => acc + w, 0n);
    if (totalWeight <= 0n) {
      throw new Error("Total contributor weight must be greater than zero");
    }

    let distributedSum = 0n;
    const allocations = contributors.map((c, idx) => {
      const payout = (distributableWei * weights[idx]) / totalWeight;
      distributedSum += payout;
      return {
        annotator: c.annotator,
        payoutWei: payout,
      };
    });

    return {
      totalPoolWei,
      totalDistributedWei: distributedSum,
      platformFeeWei,
      allocations,
    };
  }
}
