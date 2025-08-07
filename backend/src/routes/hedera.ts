import express from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { authenticateToken } from '../middleware/auth.js';
import { 
  createHederaAccount, 
  transferHBAR, 
  createSmartContract,
  executeContractFunction,
  getAccountBalance,
  recordTransaction
} from '../services/hederaService.js';

const router = express.Router();

// Create Hedera account for user
router.post('/create-account', 
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    try {
      const account = await createHederaAccount();
      
      res.json({
        message: 'Hedera account created successfully',
        accountId: account.accountId,
        publicKey: account.publicKey
        // Note: Private key should be securely stored, not returned to client
      });
    } catch (error) {
      throw createError('Failed to create Hedera account', 500);
    }
  })
);

// Get account balance
router.get('/balance/:accountId', 
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { accountId } = req.params;
    
    try {
      const balance = await getAccountBalance(accountId);
      
      res.json({
        accountId,
        balance: balance.toString()
      });
    } catch (error) {
      throw createError('Failed to get account balance', 500);
    }
  })
);

// Transfer HBAR between accounts
router.post('/transfer', 
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { fromAccountId, toAccountId, amount, memo } = req.body;
    
    if (!fromAccountId || !toAccountId || !amount) {
      throw createError('fromAccountId, toAccountId, and amount are required', 400);
    }

    try {
      const transactionId = await transferHBAR(fromAccountId, toAccountId, amount, memo);
      
      // Record transaction in database
      await recordTransaction({
        transactionId,
        fromAccountId,
        toAccountId,
        amount,
        memo,
        userId: req.user.id
      });
      
      res.json({
        message: 'Transfer completed successfully',
        transactionId
      });
    } catch (error) {
      throw createError('Failed to transfer HBAR', 500);
    }
  })
);

// Deploy smart contract
router.post('/deploy-contract', 
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { contractBytecode, gas } = req.body;
    
    if (!contractBytecode) {
      throw createError('Contract bytecode is required', 400);
    }

    try {
      const contractId = await createSmartContract(contractBytecode, gas);
      
      res.json({
        message: 'Smart contract deployed successfully',
        contractId
      });
    } catch (error) {
      throw createError('Failed to deploy smart contract', 500);
    }
  })
);

// Execute contract function
router.post('/execute-contract', 
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { contractId, functionName, parameters, gas } = req.body;
    
    if (!contractId || !functionName) {
      throw createError('contractId and functionName are required', 400);
    }

    try {
      const result = await executeContractFunction(contractId, functionName, parameters, gas);
      
      res.json({
        message: 'Contract function executed successfully',
        result
      });
    } catch (error) {
      throw createError('Failed to execute contract function', 500);
    }
  })
);

// Record product on blockchain (for supply chain tracking)
router.post('/track-product', 
  authenticateToken,
  asyncHandler(async (req: any, res: any) => {
    const { productId, businessId, productData } = req.body;
    
    if (!productId || !businessId) {
      throw createError('productId and businessId are required', 400);
    }

    try {
      // This would call a smart contract to record product data
      const transactionId = await executeContractFunction(
        process.env.STOCKY_CONTRACT_ID!,
        'trackProduct',
        [productId, businessId, JSON.stringify(productData)]
      );
      
      res.json({
        message: 'Product tracked on blockchain successfully',
        transactionId
      });
    } catch (error) {
      throw createError('Failed to track product on blockchain', 500);
    }
  })
);

export default router;
