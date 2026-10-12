export interface TaskAnnotation {
  taskId: string;
  datasetHash: string;
  annotator: string;
  qualityScore: number; // 0 - 100
}

export class DatasetValidator {
  public validateQuality(annotation: TaskAnnotation, minScore: number = 85): boolean {
    if (!annotation.datasetHash.startsWith("0x")) {
      throw new Error("Invalid IPFS / dataset hash format: must be 0x prefixed hex");
    }
    return annotation.qualityScore >= minScore;
  }
}
