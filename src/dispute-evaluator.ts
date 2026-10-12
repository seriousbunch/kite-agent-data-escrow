export interface TaskDispute {
  taskId: string;
  disputeReason: string;
  slashingBps: number;
  timestamp: number;
}

export class DisputeEvaluator {
  private disputes: Map<string, TaskDispute> = new Map();

  public fileDispute(dispute: TaskDispute): void {
    if (dispute.slashingBps > 10000) {
      throw new Error("Invalid slashing bps: cannot exceed 10000 (100%)");
    }
    this.disputes.set(dispute.taskId, dispute);
  }

  public getDispute(taskId: string): TaskDispute | undefined {
    return this.disputes.get(taskId);
  }
}
