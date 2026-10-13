import { createHash } from "crypto";

export interface DatasetChunk {
  chunkIndex: number;
  dataHash: string; // sha256 of payload chunk
  byteSize: number;
  provider: string;
}

export interface MerkleVerificationResult {
  root: string;
  leafCount: number;
  isValid: boolean;
  computedRoot: string;
}

export class DatasetMerkleAnchor {
  private leaves: string[] = [];

  constructor(chunks?: DatasetChunk[]) {
    if (chunks) {
      this.leaves = chunks.map(c => this.hashChunk(c));
    }
  }

  public hashChunk(chunk: DatasetChunk): string {
    const raw = `${chunk.chunkIndex}:${chunk.dataHash.toLowerCase()}:${chunk.byteSize}:${chunk.provider.toLowerCase()}`;
    return createHash("sha256").update(raw).digest("hex");
  }

  public addChunk(chunk: DatasetChunk): number {
    const leaf = this.hashChunk(chunk);
    this.leaves.push(leaf);
    return this.leaves.length - 1;
  }

  public computeMerkleRoot(): string {
    if (this.leaves.length === 0) {
      return "0x0000000000000000000000000000000000000000000000000000000000000000";
    }

    let layer = [...this.leaves];

    while (layer.length > 1) {
      const nextLayer: string[] = [];
      for (let i = 0; i < layer.length; i += 2) {
        if (i + 1 < layer.length) {
          const combined = layer[i] + layer[i + 1];
          const hash = createHash("sha256").update(combined).digest("hex");
          nextLayer.push(hash);
        } else {
          // Odd leaf duplication
          const combined = layer[i] + layer[i];
          const hash = createHash("sha256").update(combined).digest("hex");
          nextLayer.push(hash);
        }
      }
      layer = nextLayer;
    }

    return "0x" + layer[0];
  }

  public getLeafCount(): number {
    return this.leaves.length;
  }

  public verifyIntegrity(expectedRoot: string): MerkleVerificationResult {
    const computedRoot = this.computeMerkleRoot();
    return {
      root: expectedRoot,
      leafCount: this.leaves.length,
      isValid: computedRoot.toLowerCase() === expectedRoot.toLowerCase(),
      computedRoot
    };
  }
}
