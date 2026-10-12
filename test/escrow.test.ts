import { describe, it } from "node:test";
import assert from "node:assert";
import { DatasetValidator, KiteAgentDataEscrowClient } from "../src/index";

describe("Kite Agent Data Escrow Test Suite", () => {
  const validator = new DatasetValidator();

  it("should validate high-quality annotation proofs", () => {
    const valid = validator.validateQuality({
      taskId: "task-001",
      datasetHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      annotator: "0xworker1",
      qualityScore: 95,
    });
    assert.strictEqual(valid, true);

    const substandard = validator.validateQuality({
      taskId: "task-002",
      datasetHash: "0xabcdef",
      annotator: "0xworker2",
      qualityScore: 70,
    });
    assert.strictEqual(substandard, false);
  });

  it("should enforce milestone release rule via client", () => {
    const client = new KiteAgentDataEscrowClient();
    const approved = client.canReleaseEscrow({
      taskId: "task-003",
      datasetHash: "0x9999",
      annotator: "0xworker3",
      qualityScore: 90,
    }, 85);
    assert.strictEqual(approved, true);
  });
});
