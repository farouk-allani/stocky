// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StockyCarbonCredits
 * @dev ERC721 contract representing tokenized carbon credits that can be minted and retired
 */
contract StockyCarbonCredits is ERC721, Ownable {
    struct CarbonCredit {
        uint256 tokenId; // Token ID
        uint256 amount; // Amount of carbon offset represented (e.g. kilograms or tonnes * 1000)
        string projectId; // Off-chain project identifier
        uint256 issuedAt; // Timestamp of issuance
        bool retired; // Whether the credit has been retired (cannot be transferred)
        uint256 retiredAt; // Timestamp of retirement
        string metadataURI; // Optional metadata / IPFS URI
    }

    // tokenId => credit data
    mapping(uint256 => CarbonCredit) private _credits;
    // List of all tokenIds (enumeration without full ERC721Enumerable cost)
    uint256[] private _allTokenIds;

    uint256 private _idTracker; // simple incremental id

    // Events
    event CreditMinted(
        uint256 indexed tokenId,
        address indexed to,
        uint256 amount,
        string projectId,
        string metadataURI
    );
    event CreditRetired(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 timestamp
    );

    constructor() ERC721("Stocky Carbon Credit", "SCC") Ownable(msg.sender) {}

    /**
     * @notice Mint a new carbon credit NFT
     * @param to Recipient address
     * @param amount Amount of carbon represented (decide unit off-chain; example: tonnes * 1e3)
     * @param projectId Identifier referencing the underlying carbon reduction project
     * @param metadataURI Optional metadata URI (e.g. IPFS JSON) describing project details & verification docs
     */
    function mintCredit(
        address to,
        uint256 amount,
        string calldata projectId,
        string calldata metadataURI
    ) external onlyOwner returns (uint256 tokenId) {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be > 0");

        _idTracker += 1;
        tokenId = _idTracker;

        _safeMint(to, tokenId);

        CarbonCredit memory credit = CarbonCredit({
            tokenId: tokenId,
            amount: amount,
            projectId: projectId,
            issuedAt: block.timestamp,
            retired: false,
            retiredAt: 0,
            metadataURI: metadataURI
        });

        _credits[tokenId] = credit;
        _allTokenIds.push(tokenId);

        emit CreditMinted(tokenId, to, amount, projectId, metadataURI);
    }

    /**
     * @notice Retire (burn) a carbon credit so it cannot be transferred further.
     * Emits a CreditRetired event. Token is burned to simplify supply; metadata remains accessible via event logs.
     */
    function retire(uint256 tokenId) external {
        require(_credits[tokenId].tokenId != 0, "Nonexistent token");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        CarbonCredit storage credit = _credits[tokenId];
        require(!credit.retired, "Already retired");

        credit.retired = true;
        credit.retiredAt = block.timestamp;

        // Burn the token to prevent future transfers
        _burn(tokenId);

        emit CreditRetired(tokenId, msg.sender, block.timestamp);
    }

    /**
     * @notice Get details for a carbon credit. If retired, token no longer exists in ERC721 sense but data is retained.
     */
    function getCredit(
        uint256 tokenId
    )
        external
        view
        returns (
            uint256 amount,
            string memory projectId,
            uint256 issuedAt,
            bool retired,
            uint256 retiredAt,
            string memory metadataURI
        )
    {
        CarbonCredit memory credit = _credits[tokenId];
        require(credit.tokenId != 0, "Credit not found");
        return (
            credit.amount,
            credit.projectId,
            credit.issuedAt,
            credit.retired,
            credit.retiredAt,
            credit.metadataURI
        );
    }

    /**
     * @notice Total number of credits ever minted (including retired)
     */
    function totalMinted() external view returns (uint256) {
        return _allTokenIds.length;
    }

    /**
     * @notice Enumerate all tokenIds (gas heavy on-chain; prefer off-chain calls)
     */
    function allTokenIds() external view returns (uint256[] memory) {
        return _allTokenIds;
    }

    /**
     * @dev Override to block transfers of retired credits (should not occur since burned, but defensive)
     */
    // OZ v5 removed _beforeTokenTransfer; burning prevents further transfers already
}
