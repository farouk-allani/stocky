// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title StockySimple
 * @dev Simplified smart contract for the Stocky platform
 */
contract StockySimple {
    struct Product {
        string id;
        string name;
        string businessId;
        uint256 price;
        uint256 timestamp;
        address creator;
        bool active;
    }

    struct Business {
        string id;
        string name;
        address owner;
        bool verified;
        uint256 registrationDate;
    }

    // State variables
    mapping(string => Product) public products;
    mapping(string => Business) public businesses;
    mapping(address => string) public userBusiness;

    string[] public productList;
    string[] public businessList;

    address public owner;
    uint256 public totalProducts;
    uint256 public totalBusinesses;

    // Events
    event ProductCreated(
        string indexed productId,
        string businessId,
        address creator
    );
    event BusinessRegistered(
        string indexed businessId,
        string name,
        address owner
    );
    event ProductSold(string indexed productId, address buyer, uint256 price);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyBusinessOwner(string memory businessId) {
        require(
            businesses[businessId].owner == msg.sender,
            "Only business owner"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerBusiness(
        string memory _businessId,
        string memory _name
    ) public {
        require(
            bytes(businesses[_businessId].id).length == 0,
            "Business exists"
        );

        businesses[_businessId] = Business({
            id: _businessId,
            name: _name,
            owner: msg.sender,
            verified: false,
            registrationDate: block.timestamp
        });

        userBusiness[msg.sender] = _businessId;
        businessList.push(_businessId);
        totalBusinesses++;

        emit BusinessRegistered(_businessId, _name, msg.sender);
    }

    function createProduct(
        string memory _productId,
        string memory _name,
        string memory _businessId,
        uint256 _price
    ) public onlyBusinessOwner(_businessId) {
        require(bytes(products[_productId].id).length == 0, "Product exists");

        products[_productId] = Product({
            id: _productId,
            name: _name,
            businessId: _businessId,
            price: _price,
            timestamp: block.timestamp,
            creator: msg.sender,
            active: true
        });

        productList.push(_productId);
        totalProducts++;

        emit ProductCreated(_productId, _businessId, msg.sender);
    }

    function buyProduct(string memory _productId) public payable {
        Product storage product = products[_productId];
        require(product.active, "Product not active");
        require(msg.value >= product.price, "Insufficient payment");

        product.active = false;

        // Transfer payment to business owner
        address businessOwner = businesses[product.businessId].owner;
        payable(businessOwner).transfer(msg.value);

        emit ProductSold(_productId, msg.sender, msg.value);
    }

    function getProduct(
        string memory _productId
    )
        public
        view
        returns (
            string memory id,
            string memory name,
            string memory businessId,
            uint256 price,
            uint256 timestamp,
            address creator,
            bool active
        )
    {
        Product memory product = products[_productId];
        return (
            product.id,
            product.name,
            product.businessId,
            product.price,
            product.timestamp,
            product.creator,
            product.active
        );
    }

    function getBusiness(
        string memory _businessId
    )
        public
        view
        returns (
            string memory id,
            string memory name,
            address owner,
            bool verified,
            uint256 registrationDate
        )
    {
        Business memory business = businesses[_businessId];
        return (
            business.id,
            business.name,
            business.owner,
            business.verified,
            business.registrationDate
        );
    }

    function verifyBusiness(string memory _businessId) public onlyOwner {
        businesses[_businessId].verified = true;
    }

    function getAllProducts() public view returns (string[] memory) {
        return productList;
    }

    function getAllBusinesses() public view returns (string[] memory) {
        return businessList;
    }
}
