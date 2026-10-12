import { DatasetValidator, TaskAnnotation } from "./dataset-validator";

export class KiteAgentDataEscrowClient {
  public readonly validator: DatasetValidator;
  public readonly chainId: bigint;

  constructor(chainId: bigint = 2368n) {
    this.validator = new DatasetValidator();
    this.chainId = chainId;
  }

  public canReleaseEscrow(annotation: TaskAnnotation, threshold: number): boolean {
    return this.validator.validateQuality(annotation, threshold);
  }
}
