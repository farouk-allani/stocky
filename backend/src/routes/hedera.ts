import express from "express";
import { asyncHandler, createError } from "../middleware/errorHandler.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  createHederaAccount,
  transferHBAR,
  createSmartContract,
  executeContractFunction,
  getAccountBalance,
  recordTransaction,
} from "../services/hederaService.js";
import { contracts } from "../services/evmContracts.js";
import {
  registerBusiness,
  registerProduct,
  updateProductPrice,
  mintCarbonCredit,
  retireCarbonCredit,
} from "../services/evmSupplyChainService.js";

const router = express.Router();

// Create Hedera account for user
router.post(
  "/create-account",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    try {
      const account = await createHederaAccount();

      res.json({
        message: "Hedera account created successfully",
        accountId: account.accountId,
        publicKey: account.publicKey,
        // Note: Private key should be securely stored, not returned to client
      });
    } catch (error) {
      throw createError("Failed to create Hedera account", 500);
    }
  })
);

// Get account balance
router.get(
  "/balance/:accountId",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { accountId } = req.params;

    try {
      const balance = await getAccountBalance(accountId);

      res.json({
        accountId,
        balance: balance.toString(),
      });
    } catch (error) {
      throw createError("Failed to get account balance", 500);
    }
  })
);

// Transfer HBAR between accounts
router.post(
  "/transfer",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { fromAccountId, toAccountId, amount, memo } = req.body;

    if (!fromAccountId || !toAccountId || !amount) {
      throw createError(
        "fromAccountId, toAccountId, and amount are required",
        400
      );
    }

    try {
      const transactionId = await transferHBAR(
        fromAccountId,
        toAccountId,
        amount,
        memo
      );

      // Record transaction in database
      await recordTransaction({
        transactionId,
        fromAccountId,
        toAccountId,
        amount,
        memo,
        userId: req.user.id,
      });

      res.json({
        message: "Transfer completed successfully",
        transactionId,
      });
    } catch (error) {
      throw createError("Failed to transfer HBAR", 500);
    }
  })
);

// Deploy smart contract
router.post(
  "/deploy-contract",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { contractBytecode, gas } = req.body;

    if (!contractBytecode) {
      throw createError("Contract bytecode is required", 400);
    }

    try {
      const contractId = await createSmartContract(contractBytecode, gas);

      res.json({
        message: "Smart contract deployed successfully",
        contractId,
      });
    } catch (error) {
      throw createError("Failed to deploy smart contract", 500);
    }
  })
);

// Execute contract function
router.post(
  "/execute-contract",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { contractId, functionName, parameters, gas } = req.body;

    if (!contractId || !functionName) {
      throw createError("contractId and functionName are required", 400);
    }

    try {
      const result = await executeContractFunction(
        contractId,
        functionName,
        parameters,
        gas
      );

      res.json({
        message: "Contract function executed successfully",
        result,
      });
    } catch (error) {
      throw createError("Failed to execute contract function", 500);
    }
  })
);

// Record product on blockchain (for supply chain tracking)
router.post(
  "/track-product",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { productId, businessId, productData } = req.body;

    if (!productId || !businessId) {
      throw createError("productId and businessId are required", 400);
    }

    try {
      // This would call a smart contract to record product data
      const transactionId = await executeContractFunction(
        process.env.STOCKY_CONTRACT_ID!,
        "trackProduct",
        [productId, businessId, JSON.stringify(productData)]
      );

      res.json({
        message: "Product tracked on blockchain successfully",
        transactionId,
      });
    } catch (error) {
      throw createError("Failed to track product on blockchain", 500);
    }
  })
);

// EVM SupplyChain stats (read-only)
router.get(
  "/supply-chain/stats",
  authenticateToken,
  asyncHandler(async (_req: any, res: any) => {
    try {
      const stats = await contracts.supplyChain.getPlatformStats();
      res.json({
        totalProducts: stats[0].toString(),
        totalBusinesses: stats[1].toString(),
        totalTransactions: stats[2].toString(),
      });
    } catch (error) {
      throw createError("Failed to fetch supply chain stats", 500);
    }
  })
);

// ----- EVM WRITE OPERATIONS -----

// Register Business
router.post(
  "/evm/business",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { businessId, name, ownerName } = req.body;
    if (!businessId || !name || !ownerName) {
      throw createError("businessId, name, ownerName required", 400);
    }
    try {
      const txHash = await registerBusiness(businessId, name, ownerName);
      res.json({ txHash });
    } catch (error: any) {
      throw createError(error.message || "Failed to register business", 500);
    }
  })
);

// Register Product
router.post(
  "/evm/product",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const {
      productId,
      name,
      businessId,
      batchNumber,
      manufacturedDate,
      expiryDate,
      originalPrice,
      metadata,
    } = req.body;
    if (
      !productId ||
      !name ||
      !businessId ||
      !batchNumber ||
      manufacturedDate == null ||
      expiryDate == null ||
      originalPrice == null
    ) {
      throw createError("Missing required product fields", 400);
    }
    try {
      const txHash = await registerProduct({
        productId,
        name,
        businessId,
        batchNumber,
        manufacturedDate,
        expiryDate,
        originalPrice,
        metadata: metadata || "",
      });
      res.json({ txHash });
    } catch (error: any) {
      throw createError(error.message || "Failed to register product", 500);
    }
  })
);

// Update Product Price
router.patch(
  "/evm/product/:productId/price",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { productId } = req.params;
    const { newPrice, discount } = req.body;
    if (newPrice == null) throw createError("newPrice required", 400);
    try {
      const txHash = await updateProductPrice(
        productId,
        newPrice,
        discount || 0
      );
      res.json({ txHash });
    } catch (error: any) {
      throw createError(error.message || "Failed to update price", 500);
    }
  })
);

// Get on-chain product details (read-only)
router.get(
  "/evm/product/:productId",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { productId } = req.params;
    try {
      const data = await contracts.supplyChain.getProduct(productId);
      res.json({
        productId,
        name: data[0],
        businessId: data[1],
        originalPrice: data[2].toString(),
        currentPrice: data[3].toString(),
        discount: Number(data[4]),
        status: Number(data[5]),
        expiryDate: Number(data[6]),
        metadata: data[7],
      });
    } catch (error: any) {
      throw createError(
        error.message || "Failed to fetch on-chain product",
        500
      );
    }
  })
);

// Mint Carbon Credit
router.post(
  "/evm/carbon/mint",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { to, amount, projectId, metadataURI = "" } = req.body;
    if (amount == null || !projectId)
      throw createError("amount and projectId required", 400);
    try {
      const txHash = await mintCarbonCredit({
        to,
        amount,
        projectId,
        metadataURI,
      });
      res.json({ txHash });
    } catch (error: any) {
      throw createError(error.message || "Failed to mint carbon credit", 500);
    }
  })
);

// Retire Carbon Credit
router.post(
  "/evm/carbon/:tokenId/retire",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { tokenId } = req.params;
    try {
      const txHash = await retireCarbonCredit(Number(tokenId));
      res.json({ txHash });
    } catch (error: any) {
      throw createError(error.message || "Failed to retire carbon credit", 500);
    }
  })
);

// List Carbon Credits (on-chain enumeration)
router.get(
  "/evm/carbon/credits",
  authenticateToken,
  asyncHandler(async (_req: any, res: any) => {
    try {
      const total = await contracts.carbon.totalMinted();
      const ids = await contracts.carbon.allTokenIds();
      res.json({
        total: total.toString(),
        tokenIds: ids.map((x: any) => x.toString()),
      });
    } catch (error) {
      throw createError("Failed to list carbon credits", 500);
    }
  })
);

// Get single Carbon Credit details
router.get(
  "/evm/carbon/credits/:tokenId",
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { tokenId } = req.params;
    try {
      const data = await contracts.carbon.getCredit(tokenId);
      res.json({
        tokenId,
        amount: data[0].toString(),
        projectId: data[1],
        issuedAt: Number(data[2]),
        retired: data[3],
        retiredAt: Number(data[4]),
        metadataURI: data[5],
      });
    } catch (error) {
      throw createError("Failed to fetch credit", 500);
    }
  })
);

export default router;
