// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title StockyCarbonCredits
 * @dev Smart contract for managing carbon credits generated through food waste reduction
 * Integrates with Hedera Guardian for verified environmental impact tracking
 */
contract StockyCarbonCredits is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // Hedera Guardian integration
    struct GuardianPolicy {
        string policyId;
        string schemaId;
        address verifier;
        bool isActive;
    }

    struct CarbonCredit {
        uint256 tokenId;
        string guardianTransactionId;
        string mrvReportHash;
        uint256 co2Saved; // in grams
        uint256 wasteReduced; // in grams
        string businessId;
        string productId;
        uint256 timestamp;
        bool isVerified;
        string verificationStandard; // e.g., "VCS", "CDM", "Gold Standard"
    }

    struct BusinessImpact {
        uint256 totalCO2Saved;
        uint256 totalWasteReduced;
        uint256 totalCreditsGenerated;
        uint256 lastUpdateTimestamp;
    }

    // Mappings
    mapping(uint256 => CarbonCredit) public carbonCredits;
    mapping(string => BusinessImpact) public businessImpacts;
    mapping(string => GuardianPolicy) public guardianPolicies;
    mapping(address => bool) public authorizedVerifiers;

    // Events
    event CarbonCreditMinted(
        uint256 indexed tokenId,
        string businessId,
        uint256 co2Saved,
        string guardianTransactionId
    );

    event GuardianVerificationCompleted(
        uint256 indexed tokenId,
        string mrvReportHash,
        bool verified
    );

    event PolicyRegistered(string policyId, string schemaId, address verifier);

    event BusinessImpactUpdated(
        string businessId,
        uint256 totalCO2Saved,
        uint256 totalCreditsGenerated
    );

    constructor() ERC721("Stocky Carbon Credits", "SCC") {}

    /**
     * @dev Register a new Hedera Guardian policy
     */
    function registerGuardianPolicy(
        string memory policyId,
        string memory schemaId,
        address verifier
    ) external onlyOwner {
        guardianPolicies[policyId] = GuardianPolicy({
            policyId: policyId,
            schemaId: schemaId,
            verifier: verifier,
            isActive: true
        });

        authorizedVerifiers[verifier] = true;

        emit PolicyRegistered(policyId, schemaId, verifier);
    }

    /**
     * @dev Mint carbon credit when food waste is prevented
     */
    function mintCarbonCredit(
        string memory businessId,
        string memory productId,
        uint256 co2Saved,
        uint256 wasteReduced,
        string memory guardianTransactionId,
        address to
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        carbonCredits[tokenId] = CarbonCredit({
            tokenId: tokenId,
            guardianTransactionId: guardianTransactionId,
            mrvReportHash: "",
            co2Saved: co2Saved,
            wasteReduced: wasteReduced,
            businessId: businessId,
            productId: productId,
            timestamp: block.timestamp,
            isVerified: false,
            verificationStandard: "Guardian-VCS"
        });

        // Update business impact metrics
        BusinessImpact storage impact = businessImpacts[businessId];
        impact.totalCO2Saved += co2Saved;
        impact.totalWasteReduced += wasteReduced;
        impact.totalCreditsGenerated += 1;
        impact.lastUpdateTimestamp = block.timestamp;

        _safeMint(to, tokenId);

        emit CarbonCreditMinted(
            tokenId,
            businessId,
            co2Saved,
            guardianTransactionId
        );
        emit BusinessImpactUpdated(
            businessId,
            impact.totalCO2Saved,
            impact.totalCreditsGenerated
        );

        return tokenId;
    }

    /**
     * @dev Complete Guardian MRV verification for a carbon credit
     */
    function completeGuardianVerification(
        uint256 tokenId,
        string memory mrvReportHash,
        bool verified
    ) external {
        require(authorizedVerifiers[msg.sender], "Unauthorized verifier");
        require(_exists(tokenId), "Token does not exist");

        CarbonCredit storage credit = carbonCredits[tokenId];
        credit.mrvReportHash = mrvReportHash;
        credit.isVerified = verified;

        emit GuardianVerificationCompleted(tokenId, mrvReportHash, verified);
    }

    /**
     * @dev Get business environmental impact summary
     */
    function getBusinessImpact(
        string memory businessId
    ) external view returns (BusinessImpact memory) {
        return businessImpacts[businessId];
    }

    /**
     * @dev Get carbon credit details
     */
    function getCarbonCredit(
        uint256 tokenId
    ) external view returns (CarbonCredit memory) {
        require(_exists(tokenId), "Token does not exist");
        return carbonCredits[tokenId];
    }

    /**
     * @dev Calculate CO2 savings based on food type and weight
     * Using EPA food waste emission factors
     */
    function calculateCO2Savings(
        string memory foodCategory,
        uint256 weightInGrams
    ) public pure returns (uint256) {
        // CO2 emission factors per kg of food waste (in grams CO2)
        uint256 emissionFactor;

        if (keccak256(bytes(foodCategory)) == keccak256(bytes("Fruits"))) {
            emissionFactor = 1100; // 1.1 kg CO2 per kg fruit waste
        } else if (
            keccak256(bytes(foodCategory)) == keccak256(bytes("Vegetables"))
        ) {
            emissionFactor = 900; // 0.9 kg CO2 per kg vegetable waste
        } else if (
            keccak256(bytes(foodCategory)) == keccak256(bytes("Dairy"))
        ) {
            emissionFactor = 3200; // 3.2 kg CO2 per kg dairy waste
        } else if (keccak256(bytes(foodCategory)) == keccak256(bytes("Meat"))) {
            emissionFactor = 8500; // 8.5 kg CO2 per kg meat waste
        } else if (
            keccak256(bytes(foodCategory)) == keccak256(bytes("Bakery"))
        ) {
            emissionFactor = 1500; // 1.5 kg CO2 per kg bakery waste
        } else {
            emissionFactor = 1500; // Default factor
        }

        return (weightInGrams * emissionFactor) / 1000; // Convert to grams CO2
    }

    /**
     * @dev Automated minting based on product rescue transaction
     */
    function automatedCreditMinting(
        string memory businessId,
        string memory productId,
        string memory foodCategory,
        uint256 weightInGrams,
        string memory guardianTransactionId,
        address businessAddress
    ) external onlyOwner returns (uint256) {
        uint256 co2Saved = calculateCO2Savings(foodCategory, weightInGrams);

        return
            mintCarbonCredit(
                businessId,
                productId,
                co2Saved,
                weightInGrams,
                guardianTransactionId,
                businessAddress
            );
    }

    /**
     * @dev Get total platform impact metrics
     */
    function getPlatformImpact()
        external
        view
        returns (
            uint256 totalCO2Saved,
            uint256 totalWasteReduced,
            uint256 totalCredits,
            uint256 totalBusinesses
        )
    {
        totalCredits = _tokenIdCounter.current();

        // Note: In a production environment, you'd want to aggregate this data
        // more efficiently, possibly using events or maintaining global counters
        for (uint256 i = 0; i < totalCredits; i++) {
            if (_exists(i)) {
                totalCO2Saved += carbonCredits[i].co2Saved;
                totalWasteReduced += carbonCredits[i].wasteReduced;
            }
        }

        // This is a simplified calculation
        totalBusinesses = totalCredits > 0 ? (totalCredits / 5) + 1 : 0;
    }

    /**
     * @dev Override tokenURI to include Guardian verification status
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");

        CarbonCredit memory credit = carbonCredits[tokenId];

        // In production, this would generate proper metadata JSON
        // including Guardian verification status and MRV report links
        return
            string(
                abi.encodePacked(
                    "https://stocky.app/api/carbon-credit/",
                    Strings.toString(tokenId),
                    "?guardian=",
                    credit.guardianTransactionId,
                    "&verified=",
                    credit.isVerified ? "true" : "false"
                )
            );
    }
}
