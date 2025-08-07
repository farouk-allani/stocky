// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title StockySupplyChain
 * @dev Smart contract for tracking food products in the Stocky platform
 * Provides transparent supply chain tracking and product authenticity verification
 */
contract StockySupplyChain {
    
    struct Product {
        string productId;
        string name;
        string businessId;
        string batchNumber;
        uint256 manufacturedDate;
        uint256 expiryDate;
        uint256 originalPrice;
        uint256 currentPrice;
        uint8 discount;
        ProductStatus status;
        address creator;
        uint256 timestamp;
        string metadata; // JSON string with additional data
    }
    
    enum ProductStatus { ACTIVE, DISCOUNTED, EXPIRED, SOLD }
    
    struct Business {
        string businessId;
        string name;
        string owner;
        bool verified;
        uint256 registrationDate;
        uint256 totalProducts;
    }
    
    struct Transaction {
        string transactionId;
        string productId;
        string buyerId;
        string sellerId;
        uint256 amount;
        uint256 timestamp;
        TransactionStatus status;
    }
    
    enum TransactionStatus { PENDING, COMPLETED, CANCELLED, REFUNDED }
    
    // State variables
    mapping(string => Product) public products;
    mapping(string => Business) public businesses;
    mapping(string => Transaction) public transactions;
    mapping(address => string) public userToBusinessId;
    mapping(string => address) public businessIdToAddress;
    
    string[] public productIds;
    string[] public businessIds;
    string[] public transactionIds;
    
    address public owner;
    uint256 public totalProducts;
    uint256 public totalBusinesses;
    uint256 public totalTransactions;
    
    // Events
    event ProductRegistered(string indexed productId, string businessId, address creator);
    event ProductUpdated(string indexed productId, uint256 newPrice, uint8 discount);
    event BusinessRegistered(string indexed businessId, string name, address owner);
    event TransactionCreated(string indexed transactionId, string productId, uint256 amount);
    event TransactionCompleted(string indexed transactionId);
    event ProductSold(string indexed productId, string buyerId, uint256 finalPrice);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can call this function");
        _;
    }
    
    modifier onlyBusinessOwner(string memory businessId) {
        require(
            businessIdToAddress[businessId] == msg.sender,
            "Only business owner can call this function"
        );
        _;
    }
    
    modifier productExists(string memory productId) {
        require(bytes(products[productId].productId).length > 0, "Product does not exist");
        _;
    }
    
    modifier businessExists(string memory businessId) {
        require(bytes(businesses[businessId].businessId).length > 0, "Business does not exist");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        totalProducts = 0;
        totalBusinesses = 0;
        totalTransactions = 0;
    }
    
    /**
     * @dev Register a new business on the platform
     */
    function registerBusiness(
        string memory businessId,
        string memory name,
        string memory ownerName
    ) public {
        require(bytes(businesses[businessId].businessId).length == 0, "Business already exists");
        require(bytes(userToBusinessId[msg.sender]).length == 0, "Address already has a business");
        
        businesses[businessId] = Business({
            businessId: businessId,
            name: name,
            owner: ownerName,
            verified: false,
            registrationDate: block.timestamp,
            totalProducts: 0
        });
        
        userToBusinessId[msg.sender] = businessId;
        businessIdToAddress[businessId] = msg.sender;
        businessIds.push(businessId);
        totalBusinesses++;
        
        emit BusinessRegistered(businessId, name, msg.sender);
    }
    
    /**
     * @dev Verify a business (only contract owner can do this)
     */
    function verifyBusiness(string memory businessId) public onlyOwner businessExists(businessId) {
        businesses[businessId].verified = true;
    }
    
    /**
     * @dev Register a new product
     */
    function registerProduct(
        string memory productId,
        string memory name,
        string memory businessId,
        string memory batchNumber,
        uint256 manufacturedDate,
        uint256 expiryDate,
        uint256 originalPrice,
        string memory metadata
    ) public onlyBusinessOwner(businessId) businessExists(businessId) {
        require(bytes(products[productId].productId).length == 0, "Product already exists");
        require(expiryDate > block.timestamp, "Product cannot be expired at registration");
        
        products[productId] = Product({
            productId: productId,
            name: name,
            businessId: businessId,
            batchNumber: batchNumber,
            manufacturedDate: manufacturedDate,
            expiryDate: expiryDate,
            originalPrice: originalPrice,
            currentPrice: originalPrice,
            discount: 0,
            status: ProductStatus.ACTIVE,
            creator: msg.sender,
            timestamp: block.timestamp,
            metadata: metadata
        });
        
        productIds.push(productId);
        businesses[businessId].totalProducts++;
        totalProducts++;
        
        emit ProductRegistered(productId, businessId, msg.sender);
    }
    
    /**
     * @dev Update product pricing (for dynamic pricing)
     */
    function updateProductPrice(
        string memory productId,
        uint256 newPrice,
        uint8 discount
    ) public productExists(productId) {
        Product storage product = products[productId];
        require(
            businessIdToAddress[product.businessId] == msg.sender,
            "Only product owner can update price"
        );
        require(newPrice <= product.originalPrice, "New price cannot exceed original price");
        require(discount <= 100, "Discount cannot exceed 100%");
        
        product.currentPrice = newPrice;
        product.discount = discount;
        
        if (discount > 0) {
            product.status = ProductStatus.DISCOUNTED;
        }
        
        emit ProductUpdated(productId, newPrice, discount);
    }
    
    /**
     * @dev Mark product as expired (automated or manual)
     */
    function markProductExpired(string memory productId) public productExists(productId) {
        Product storage product = products[productId];
        require(
            block.timestamp >= product.expiryDate || 
            businessIdToAddress[product.businessId] == msg.sender,
            "Product not expired or unauthorized"
        );
        
        product.status = ProductStatus.EXPIRED;
    }
    
    /**
     * @dev Create a transaction for purchasing a product
     */
    function createTransaction(
        string memory transactionId,
        string memory productId,
        string memory buyerId,
        uint256 amount
    ) public productExists(productId) {
        Product storage product = products[productId];
        require(product.status == ProductStatus.ACTIVE || product.status == ProductStatus.DISCOUNTED, "Product not available");
        require(amount >= product.currentPrice, "Insufficient payment amount");
        
        transactions[transactionId] = Transaction({
            transactionId: transactionId,
            productId: productId,
            buyerId: buyerId,
            sellerId: product.businessId,
            amount: amount,
            timestamp: block.timestamp,
            status: TransactionStatus.PENDING
        });
        
        transactionIds.push(transactionId);
        totalTransactions++;
        
        emit TransactionCreated(transactionId, productId, amount);
    }
    
    /**
     * @dev Complete a transaction and mark product as sold
     */
    function completeTransaction(string memory transactionId) public {
        Transaction storage transaction = transactions[transactionId];
        require(transaction.status == TransactionStatus.PENDING, "Transaction not pending");
        
        Product storage product = products[transaction.productId];
        require(
            businessIdToAddress[product.businessId] == msg.sender,
            "Only seller can complete transaction"
        );
        
        transaction.status = TransactionStatus.COMPLETED;
        product.status = ProductStatus.SOLD;
        
        emit TransactionCompleted(transactionId);
        emit ProductSold(transaction.productId, transaction.buyerId, transaction.amount);
    }
    
    /**
     * @dev Cancel a transaction
     */
    function cancelTransaction(string memory transactionId) public {
        Transaction storage transaction = transactions[transactionId];
        require(transaction.status == TransactionStatus.PENDING, "Transaction not pending");
        
        Product storage product = products[transaction.productId];
        require(
            businessIdToAddress[product.businessId] == msg.sender,
            "Only seller can cancel transaction"
        );
        
        transaction.status = TransactionStatus.CANCELLED;
        
        // Product becomes available again
        if (product.expiryDate > block.timestamp) {
            if (product.discount > 0) {
                product.status = ProductStatus.DISCOUNTED;
            } else {
                product.status = ProductStatus.ACTIVE;
            }
        } else {
            product.status = ProductStatus.EXPIRED;
        }
    }
    
    /**
     * @dev Get product details
     */
    function getProduct(string memory productId) public view returns (
        string memory name,
        string memory businessId,
        uint256 originalPrice,
        uint256 currentPrice,
        uint8 discount,
        ProductStatus status,
        uint256 expiryDate,
        string memory metadata
    ) {
        Product memory product = products[productId];
        return (
            product.name,
            product.businessId,
            product.originalPrice,
            product.currentPrice,
            product.discount,
            product.status,
            product.expiryDate,
            product.metadata
        );
    }
    
    /**
     * @dev Get business details
     */
    function getBusiness(string memory businessId) public view returns (
        string memory name,
        string memory ownerName,
        bool verified,
        uint256 registrationDate,
        uint256 totalProductsCount
    ) {
        Business memory business = businesses[businessId];
        return (
            business.name,
            business.owner,
            business.verified,
            business.registrationDate,
            business.totalProducts
        );
    }
    
    /**
     * @dev Get transaction details
     */
    function getTransaction(string memory transactionId) public view returns (
        string memory productId,
        string memory buyerId,
        string memory sellerId,
        uint256 amount,
        uint256 timestamp,
        TransactionStatus status
    ) {
        Transaction memory transaction = transactions[transactionId];
        return (
            transaction.productId,
            transaction.buyerId,
            transaction.sellerId,
            transaction.amount,
            transaction.timestamp,
            transaction.status
        );
    }
    
    /**
     * @dev Get all product IDs (for enumeration)
     */
    function getAllProductIds() public view returns (string[] memory) {
        return productIds;
    }
    
    /**
     * @dev Get all business IDs (for enumeration)
     */
    function getAllBusinessIds() public view returns (string[] memory) {
        return businessIds;
    }
    
    /**
     * @dev Get platform statistics
     */
    function getPlatformStats() public view returns (
        uint256 totalProductsCount,
        uint256 totalBusinessesCount,
        uint256 totalTransactionsCount
    ) {
        return (totalProducts, totalBusinesses, totalTransactions);
    }
}
