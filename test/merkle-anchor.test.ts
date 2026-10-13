import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DatasetMerkleAnchor, DatasetChunk } from "../src/merkle-anchor";

describe("DatasetMerkleAnchor Test Suite", () => {
  it("computes reproducible Merkle root for multi-chunk datasets", () => {
    const chunks: DatasetChunk[] = [
      {
        chunkIndex: 0,
        dataHash: "1111111111111111111111111111111111111111111111111111111111111111",
        byteSize: 1024,
        provider: "0x1234567890123456789012345678901234567890"
      },
      {
        chunkIndex: 1,
        dataHash: "2222222222222222222222222222222222222222222222222222222222222222",
        byteSize: 2048,
        provider: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
      },
      {
        chunkIndex: 2,
        dataHash: "3333333333333333333333333333333333333333333333333333333333333333",
        byteSize: 4096,
        provider: "0x1234567890123456789012345678901234567890"
      }
    ];

    const anchor1 = new DatasetMerkleAnchor(chunks);
    const root1 = anchor1.computeMerkleRoot();

    const anchor2 = new DatasetMerkleAnchor();
    chunks.forEach(c => anchor2.addChunk(c));
    const root2 = anchor2.computeMerkleRoot();

    assert.equal(root1, root2);
    assert.ok(root1.startsWith("0x"));
    assert.equal(anchor1.getLeafCount(), 3);

    const verification = anchor1.verifyIntegrity(root1);
    assert.equal(verification.isValid, true);
    assert.equal(verification.computedRoot, root1);
  });

  it("fails verification if dataset root does not match", () => {
    const anchor = new DatasetMerkleAnchor([
      {
        chunkIndex: 0,
        dataHash: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        byteSize: 512,
        provider: "0x9999999999999999999999999999999999999999"
      }
    ]);

    const result = anchor.verifyIntegrity("0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef");
    assert.equal(result.isValid, false);
  });
});
