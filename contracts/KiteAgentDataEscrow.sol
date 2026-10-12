// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

/**
 * @title KiteAgentDataEscrow
 * @notice Decentralized AI dataset annotation escrow & x402 revenue share on Kite Chain.
 */
contract KiteAgentDataEscrow {
    enum EscrowStatus { Active, Completed, Disputed, Refunded }

    struct TaskEscrow {
        bytes32 taskId;
        address buyer;
        address worker;
        uint256 deposit;
        bytes32 datasetHash;
        uint256 deadline;
        EscrowStatus status;
    }

    mapping(bytes32 => TaskEscrow) public tasks;
    uint256 public totalEscrowsCreated;

    event TaskCreated(bytes32 indexed taskId, address indexed buyer, address indexed worker, uint256 deposit);
    event ProofSubmitted(bytes32 indexed taskId, bytes32 datasetHash);
    event MilestoneReleased(bytes32 indexed taskId, uint256 payout);
    event TaskDisputed(bytes32 indexed taskId, address indexed reporter);

    error Unauthorized();
    error InvalidState();
    error Expired();

    function createTask(bytes32 taskId, address worker, uint256 duration) external payable {
        require(msg.value > 0, "Deposit required");
        require(tasks[taskId].status == EscrowStatus.Active, "Task already exists");

        tasks[taskId] = TaskEscrow({
            taskId: taskId,
            buyer: msg.sender,
            worker: worker,
            deposit: msg.value,
            datasetHash: bytes32(0),
            deadline: block.timestamp + duration,
            status: EscrowStatus.Active
        });

        totalEscrowsCreated++;
        emit TaskCreated(taskId, msg.sender, worker, msg.value);
    }

    function submitProof(bytes32 taskId, bytes32 datasetHash) external {
        TaskEscrow storage task = tasks[taskId];
        if (msg.sender != task.worker) revert Unauthorized();
        if (task.status != EscrowStatus.Active) revert InvalidState();

        task.datasetHash = datasetHash;
        emit ProofSubmitted(taskId, datasetHash);
    }

    function releaseReward(bytes32 taskId) external {
        TaskEscrow storage task = tasks[taskId];
        if (msg.sender != task.buyer) revert Unauthorized();
        if (task.status != EscrowStatus.Active) revert InvalidState();

        task.status = EscrowStatus.Completed;
        payable(task.worker).transfer(task.deposit);

        emit MilestoneReleased(taskId, task.deposit);
    }
}
