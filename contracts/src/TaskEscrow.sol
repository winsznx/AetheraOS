// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 */
abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 */
abstract contract Ownable {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        _transferOwnership(msg.sender);
    }

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function _checkOwner() internal view virtual {
        require(owner() == msg.sender, "Ownable: caller is not the owner");
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

/**
 * @title TaskEscrow
 * @notice Escrow contract for AetheraOS task marketplace
 * @dev Handles task creation, claiming, work submission, and payment distribution
 */
contract TaskEscrow is ReentrancyGuard, Ownable {
    uint256 private taskCounter;

    enum TaskStatus { OPEN, CLAIMED, SUBMITTED, VERIFIED, COMPLETED, DISPUTED }

    struct Task {
        uint256 id;
        address requester;
        address worker;
        string title;
        string description;
        uint256 budget;
        uint256 deadline;
        string proofHash; // IPFS hash of work proof
        TaskStatus status;
        bool paid;
        uint256 createdAt;
    }

    // Task ID => Task
    mapping(uint256 => Task) public tasks;

    // Platform fee (2% = 200 basis points)
    uint256 public constant PLATFORM_FEE_BPS = 200;
    uint256 public constant BPS_DENOMINATOR = 10000;

    address public platformWallet;

    // Events
    event TaskCreated(
        uint256 indexed taskId,
        address indexed requester,
        string title,
        uint256 budget,
        uint256 deadline
    );

    event TaskClaimed(
        uint256 indexed taskId,
        address indexed worker
    );

    event WorkSubmitted(
        uint256 indexed taskId,
        string proofHash
    );

    event TaskVerified(
        uint256 indexed taskId,
        bool approved
    );

    event PaymentReleased(
        uint256 indexed taskId,
        address indexed worker,
        uint256 amount,
        uint256 platformFee
    );

    event TaskDisputed(
        uint256 indexed taskId
    );

    event PlatformWalletUpdated(
        address indexed oldWallet,
        address indexed newWallet
    );

    constructor(address _platformWallet) {
        require(_platformWallet != address(0), "Invalid platform wallet");
        platformWallet = _platformWallet;
    }

    /**
     * @notice Update the platform wallet address
     * @param _newWallet New platform wallet address
     */
    function setPlatformWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid platform wallet");
        emit PlatformWalletUpdated(platformWallet, _newWallet);
        platformWallet = _newWallet;
    }

    /**
     * @notice Create a new task with escrowed payment
     * @param title Task title
     * @param description Task description
     * @param deadline Unix timestamp for task deadline
     */
    function createTask(
        string memory title,
        string memory description,
        uint256 deadline
    ) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "Budget must be greater than 0");
        require(deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(title).length > 0, "Title cannot be empty");

        taskCounter++;
        uint256 taskId = taskCounter;

        tasks[taskId] = Task({
            id: taskId,
            requester: msg.sender,
            worker: address(0),
            title: title,
            description: description,
            budget: msg.value,
            deadline: deadline,
            proofHash: "",
            status: TaskStatus.OPEN,
            paid: false,
            createdAt: block.timestamp
        });

        emit TaskCreated(taskId, msg.sender, title, msg.value, deadline);

        return taskId;
    }

    /**
     * @notice Claim an open task
     * @param taskId ID of the task to claim
     */
    function claimTask(uint256 taskId) external {
        Task storage task = tasks[taskId];

        require(task.id != 0, "Task does not exist");
        require(task.status == TaskStatus.OPEN, "Task is not open");
        require(task.worker == address(0), "Task already claimed");
        require(msg.sender != task.requester, "Requester cannot claim own task");

        task.worker = msg.sender;
        task.status = TaskStatus.CLAIMED;

        emit TaskClaimed(taskId, msg.sender);
    }

    /**
     * @notice Submit work proof for a claimed task
     * @param taskId ID of the task
     * @param proofHash IPFS hash of the work proof
     */
    function submitWork(uint256 taskId, string memory proofHash) external {
        Task storage task = tasks[taskId];

        require(task.id != 0, "Task does not exist");
        require(task.worker == msg.sender, "Only assigned worker can submit");
        require(task.status == TaskStatus.CLAIMED, "Task not in claimed state");
        require(bytes(proofHash).length > 0, "Proof hash cannot be empty");

        task.proofHash = proofHash;
        task.status = TaskStatus.SUBMITTED;

        emit WorkSubmitted(taskId, proofHash);
    }

    /**
     * @notice Verify submitted work and release payment if approved
     * @param taskId ID of the task
     * @param approved Whether the work is approved
     */
    function verifyWork(uint256 taskId, bool approved) external {
        Task storage task = tasks[taskId];

        require(task.id != 0, "Task does not exist");
        require(task.requester == msg.sender, "Only requester can verify");
        require(task.status == TaskStatus.SUBMITTED, "Work not submitted yet");
        require(!task.paid, "Payment already released");

        if (approved) {
            task.status = TaskStatus.VERIFIED;
            emit TaskVerified(taskId, true);

            // Release payment
            _releasePayment(taskId);
        } else {
            task.status = TaskStatus.DISPUTED;
            emit TaskVerified(taskId, false);
            emit TaskDisputed(taskId);
        }
    }

    /**
     * @notice Internal function to release payment
     * @param taskId ID of the task
     */
    function _releasePayment(uint256 taskId) internal nonReentrant {
        Task storage task = tasks[taskId];

        require(task.status == TaskStatus.VERIFIED, "Task not verified");
        require(!task.paid, "Already paid");

        // Calculate platform fee
        uint256 platformFee = (task.budget * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        uint256 workerPayment = task.budget - platformFee;

        task.paid = true;
        task.status = TaskStatus.COMPLETED;

        // Transfer payments
        (bool workerSuccess, ) = task.worker.call{value: workerPayment}("");
        require(workerSuccess, "Worker payment failed");

        (bool platformSuccess, ) = platformWallet.call{value: platformFee}("");
        require(platformSuccess, "Platform fee transfer failed");

        emit PaymentReleased(taskId, task.worker, workerPayment, platformFee);
    }

    /**
     * @notice Get task details
     * @param taskId ID of the task
     */
    function getTask(uint256 taskId) external view returns (Task memory) {
        require(tasks[taskId].id != 0, "Task does not exist");
        return tasks[taskId];
    }

    /**
     * @notice Get total number of tasks created
     */
    function getTotalTasks() external view returns (uint256) {
        return taskCounter;
    }

    /**
     * @notice Emergency withdraw for disputed tasks (only requester after deadline)
     * @param taskId ID of the task
     */
    function emergencyWithdraw(uint256 taskId) external nonReentrant {
        Task storage task = tasks[taskId];

        require(task.id != 0, "Task does not exist");
        require(task.requester == msg.sender, "Only requester can withdraw");
        require(!task.paid, "Payment already released");
        require(
            task.status == TaskStatus.DISPUTED ||
            (task.status == TaskStatus.OPEN && block.timestamp > task.deadline),
            "Cannot withdraw yet"
        );

        task.paid = true;
        task.status = TaskStatus.DISPUTED;

        (bool success, ) = task.requester.call{value: task.budget}("");
        require(success, "Refund failed");
    }
}
