// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title StockyPayments
 * @dev Smart contract for handling payments in the Stocky platform
 * Supports HBAR payments with escrow functionality
 */
contract StockyPayments {
    struct Payment {
        string paymentId;
        string orderId;
        string buyerId;
        string sellerId;
        uint256 amount;
        uint256 timestamp;
        PaymentStatus status;
        uint256 escrowReleaseTime;
    }

    enum PaymentStatus {
        PENDING,
        ESCROWED,
        COMPLETED,
        REFUNDED,
        DISPUTED
    }

    // State variables
    mapping(string => Payment) public payments;
    mapping(string => uint256) public escrowBalances; // seller address -> escrowed amount
    mapping(address => bool) public authorizedUsers;

    string[] public paymentIds;
    address public owner;
    uint256 public totalPayments;
    uint256 public platformFeePercent = 250; // 2.5% platform fee (in basis points)
    uint256 public escrowPeriod = 24 hours; // Default escrow period

    // Events
    event PaymentCreated(
        string indexed paymentId,
        string orderId,
        uint256 amount
    );
    event PaymentEscrowed(string indexed paymentId, uint256 releaseTime);
    event PaymentCompleted(string indexed paymentId, uint256 amount);
    event PaymentRefunded(string indexed paymentId, uint256 amount);
    event PaymentDisputed(string indexed paymentId);
    event EscrowReleased(
        string indexed paymentId,
        string sellerId,
        uint256 amount
    );

    // Modifiers
    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only contract owner can call this function"
        );
        _;
    }

    modifier onlyAuthorized() {
        require(
            authorizedUsers[msg.sender] || msg.sender == owner,
            "Not authorized"
        );
        _;
    }

    modifier paymentExists(string memory paymentId) {
        require(
            bytes(payments[paymentId].paymentId).length > 0,
            "Payment does not exist"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedUsers[msg.sender] = true;
        totalPayments = 0;
    }

    /**
     * @dev Add authorized user (backend service)
     */
    function addAuthorizedUser(address user) public onlyOwner {
        authorizedUsers[user] = true;
    }

    /**
     * @dev Remove authorized user
     */
    function removeAuthorizedUser(address user) public onlyOwner {
        authorizedUsers[user] = false;
    }

    /**
     * @dev Set platform fee percentage (in basis points)
     */
    function setPlatformFee(uint256 feePercent) public onlyOwner {
        require(feePercent <= 1000, "Platform fee cannot exceed 10%"); // Max 10%
        platformFeePercent = feePercent;
    }

    /**
     * @dev Set escrow period
     */
    function setEscrowPeriod(uint256 periodInSeconds) public onlyOwner {
        escrowPeriod = periodInSeconds;
    }

    /**
     * @dev Create a new payment (called by backend)
     */
    function createPayment(
        string memory paymentId,
        string memory orderId,
        string memory buyerId,
        string memory sellerId,
        uint256 amount
    ) public payable onlyAuthorized {
        require(
            bytes(payments[paymentId].paymentId).length == 0,
            "Payment already exists"
        );
        require(msg.value >= amount, "Insufficient payment amount");

        payments[paymentId] = Payment({
            paymentId: paymentId,
            orderId: orderId,
            buyerId: buyerId,
            sellerId: sellerId,
            amount: amount,
            timestamp: block.timestamp,
            status: PaymentStatus.PENDING,
            escrowReleaseTime: 0
        });

        paymentIds.push(paymentId);
        totalPayments++;

        emit PaymentCreated(paymentId, orderId, amount);
    }

    /**
     * @dev Move payment to escrow (when order is confirmed)
     */
    function escrowPayment(
        string memory paymentId
    ) public onlyAuthorized paymentExists(paymentId) {
        Payment storage payment = payments[paymentId];
        require(
            payment.status == PaymentStatus.PENDING,
            "Payment not in pending status"
        );

        payment.status = PaymentStatus.ESCROWED;
        payment.escrowReleaseTime = block.timestamp + escrowPeriod;
        escrowBalances[payment.sellerId] += payment.amount;

        emit PaymentEscrowed(paymentId, payment.escrowReleaseTime);
    }

    /**
     * @dev Complete payment (release from escrow to seller)
     */
    function completePayment(
        string memory paymentId
    ) public onlyAuthorized paymentExists(paymentId) {
        Payment storage payment = payments[paymentId];
        require(
            payment.status == PaymentStatus.ESCROWED ||
                payment.status == PaymentStatus.PENDING,
            "Payment not in valid status"
        );

        if (payment.status == PaymentStatus.ESCROWED) {
            require(
                escrowBalances[payment.sellerId] >= payment.amount,
                "Insufficient escrow balance"
            );
            escrowBalances[payment.sellerId] -= payment.amount;
        }

        payment.status = PaymentStatus.COMPLETED;

        // Calculate platform fee
        uint256 platformFee = (payment.amount * platformFeePercent) / 10000;
        uint256 sellerAmount = payment.amount - platformFee;

        // Transfer to seller (this would need to be implemented with actual HBAR transfers)
        // For now, we're just tracking the amounts

        emit PaymentCompleted(paymentId, sellerAmount);
    }

    /**
     * @dev Refund payment to buyer
     */
    function refundPayment(
        string memory paymentId
    ) public onlyAuthorized paymentExists(paymentId) {
        Payment storage payment = payments[paymentId];
        require(
            payment.status == PaymentStatus.PENDING ||
                payment.status == PaymentStatus.ESCROWED,
            "Payment cannot be refunded"
        );

        if (payment.status == PaymentStatus.ESCROWED) {
            require(
                escrowBalances[payment.sellerId] >= payment.amount,
                "Insufficient escrow balance"
            );
            escrowBalances[payment.sellerId] -= payment.amount;
        }

        payment.status = PaymentStatus.REFUNDED;

        // Refund to buyer (this would need to be implemented with actual HBAR transfers)

        emit PaymentRefunded(paymentId, payment.amount);
    }

    /**
     * @dev Dispute payment
     */
    function disputePayment(
        string memory paymentId
    ) public onlyAuthorized paymentExists(paymentId) {
        Payment storage payment = payments[paymentId];
        require(
            payment.status == PaymentStatus.ESCROWED,
            "Only escrowed payments can be disputed"
        );

        payment.status = PaymentStatus.DISPUTED;

        emit PaymentDisputed(paymentId);
    }

    /**
     * @dev Auto-release escrow after escrow period
     */
    function autoReleaseEscrow(
        string memory paymentId
    ) public paymentExists(paymentId) {
        Payment storage payment = payments[paymentId];
        require(
            payment.status == PaymentStatus.ESCROWED,
            "Payment not in escrow"
        );
        require(
            block.timestamp >= payment.escrowReleaseTime,
            "Escrow period not yet ended"
        );

        escrowBalances[payment.sellerId] -= payment.amount;
        payment.status = PaymentStatus.COMPLETED;

        // Calculate platform fee
        uint256 platformFee = (payment.amount * platformFeePercent) / 10000;
        uint256 sellerAmount = payment.amount - platformFee;

        emit EscrowReleased(paymentId, payment.sellerId, sellerAmount);
        emit PaymentCompleted(paymentId, sellerAmount);
    }

    /**
     * @dev Get payment details
     */
    function getPayment(
        string memory paymentId
    )
        public
        view
        returns (
            string memory orderId,
            string memory buyerId,
            string memory sellerId,
            uint256 amount,
            uint256 timestamp,
            PaymentStatus status,
            uint256 escrowReleaseTime
        )
    {
        Payment memory payment = payments[paymentId];
        return (
            payment.orderId,
            payment.buyerId,
            payment.sellerId,
            payment.amount,
            payment.timestamp,
            payment.status,
            payment.escrowReleaseTime
        );
    }

    /**
     * @dev Get escrow balance for a seller
     */
    function getEscrowBalance(
        string memory sellerId
    ) public view returns (uint256) {
        return escrowBalances[sellerId];
    }

    /**
     * @dev Get all payment IDs
     */
    function getAllPaymentIds() public view returns (string[] memory) {
        return paymentIds;
    }

    /**
     * @dev Get platform statistics
     */
    function getPlatformStats()
        public
        view
        returns (
            uint256 totalPaymentsCount,
            uint256 platformFeePercentage,
            uint256 escrowPeriodSeconds
        )
    {
        return (totalPayments, platformFeePercent, escrowPeriod);
    }

    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    /**
     * @dev Receive function to accept HBAR
     */
    receive() external payable {}
}
