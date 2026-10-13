import { describe, it } from "node:test";
import assert from "node:assert";
import { RevenueShareCalculator } from "../src/revenue-share";

describe("RevenueShareCalculator Test Suite", () => {
  it("splits revenue proportionally after protocol fee deduction", () => {
    const calculator = new RevenueShareCalculator(300); // 3% fee
    const pool = 10_000n; // 10,000 wei

    const result = calculator.calculatePayouts(pool, [
      { annotator: "0x1111", labelsVerified: 50, qualityBonusBps: 0 },
      { annotator: "0x2222", labelsVerified: 50, qualityBonusBps: 0 },
    ]);

    assert.strictEqual(result.platformFeeWei, 300n);
    assert.strictEqual(result.totalDistributedWei, 9_700n);
    assert.strictEqual(result.allocations[0].payoutWei, 4_850n);
    assert.strictEqual(result.allocations[1].payoutWei, 4_850n);
  });

  it("applies accuracy bonus weighting correctly", () => {
    const calculator = new RevenueShareCalculator(0); // 0% fee
    const pool = 22_000n;

    const result = calculator.calculatePayouts(pool, [
      { annotator: "0x1111", labelsVerified: 100, qualityBonusBps: 0 }, // weight 1,000,000
      { annotator: "0x2222", labelsVerified: 100, qualityBonusBps: 2000 }, // weight 1,200,000 (+20%)
    ]);

    assert.strictEqual(result.allocations[0].payoutWei, 10_000n);
    assert.strictEqual(result.allocations[1].payoutWei, 12_000n);
  });
});
