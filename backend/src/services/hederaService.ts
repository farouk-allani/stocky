import {
  Client,
  AccountCreateTransaction,
  AccountBalanceQuery,
  TransferTransaction,
  Hbar,
  PrivateKey,
  PublicKey,
  AccountId,
  ContractCreateTransaction,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  FileCreateTransaction,
  FileAppendTransaction
} from '@hashgraph/sdk';
import { getDatabase } from '../config/database.js';
import { logger } from '../utils/logger.js';

// Initialize Hedera client
const client = Client.forTestnet();

// Set operator account (the account that pays for transactions)
if (process.env.HEDERA_ACCOUNT_ID && process.env.HEDERA_PRIVATE_KEY) {
  const operatorAccountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
  const operatorPrivateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
  client.setOperator(operatorAccountId, operatorPrivateKey);
}

export interface HederaAccount {
  accountId: string;
  publicKey: string;
  privateKey: string;
}

export const createHederaAccount = async (): Promise<HederaAccount> => {
  try {
    // Generate new key pair
    const privateKey = PrivateKey.generateED25519();
    const publicKey = privateKey.publicKey;

    // Create account
    const createAccountTx = new AccountCreateTransaction()
      .setKey(publicKey)
      .setInitialBalance(new Hbar(10)) // Initial balance of 10 HBAR
      .setAccountMemo("Stocky user account");

    const createAccountTxResponse = await createAccountTx.execute(client);
    const createAccountReceipt = await createAccountTxResponse.getReceipt(client);
    const accountId = createAccountReceipt.accountId;

    if (!accountId) {
      throw new Error('Failed to create account');
    }

    logger.info('Hedera account created', { accountId: accountId.toString() });

    return {
      accountId: accountId.toString(),
      publicKey: publicKey.toString(),
      privateKey: privateKey.toString()
    };
  } catch (error) {
    logger.error('Failed to create Hedera account:', error);
    throw error;
  }
};

export const getAccountBalance = async (accountId: string): Promise<Hbar> => {
  try {
    const balance = await new AccountBalanceQuery()
      .setAccountId(AccountId.fromString(accountId))
      .execute(client);

    return balance.hbars;
  } catch (error) {
    logger.error('Failed to get account balance:', error);
    throw error;
  }
};

export const transferHBAR = async (
  fromAccountId: string,
  toAccountId: string,
  amount: number,
  memo?: string
): Promise<string> => {
  try {
    // Note: In a real application, you would need the private key of the sender
    // For now, this assumes the operator account is the sender
    const transferTx = new TransferTransaction()
      .addHbarTransfer(AccountId.fromString(fromAccountId), new Hbar(-amount))
      .addHbarTransfer(AccountId.fromString(toAccountId), new Hbar(amount));

    if (memo) {
      transferTx.setTransactionMemo(memo);
    }

    const transferTxResponse = await transferTx.execute(client);
    const transferReceipt = await transferTxResponse.getReceipt(client);

    logger.info('HBAR transfer completed', {
      from: fromAccountId,
      to: toAccountId,
      amount,
      transactionId: transferTxResponse.transactionId?.toString()
    });

    return transferTxResponse.transactionId?.toString() || '';
  } catch (error) {
    logger.error('Failed to transfer HBAR:', error);
    throw error;
  }
};

export const createSmartContract = async (
  contractBytecode: string,
  gas: number = 100000
): Promise<string> => {
  try {
    // First, store the contract bytecode in a file
    const fileCreateTx = new FileCreateTransaction()
      .setContents(contractBytecode)
      .setKeys([client.operatorPublicKey!]);

    const fileCreateTxResponse = await fileCreateTx.execute(client);
    const fileCreateReceipt = await fileCreateTxResponse.getReceipt(client);
    const fileId = fileCreateReceipt.fileId;

    if (!fileId) {
      throw new Error('Failed to create file');
    }

    // Create the contract
    const contractCreateTx = new ContractCreateTransaction()
      .setBytecodeFileId(fileId)
      .setGas(gas)
      .setConstructorParameters(new ContractFunctionParameters());

    const contractCreateTxResponse = await contractCreateTx.execute(client);
    const contractCreateReceipt = await contractCreateTxResponse.getReceipt(client);
    const contractId = contractCreateReceipt.contractId;

    if (!contractId) {
      throw new Error('Failed to create contract');
    }

    logger.info('Smart contract deployed', { contractId: contractId.toString() });

    return contractId.toString();
  } catch (error) {
    logger.error('Failed to deploy smart contract:', error);
    throw error;
  }
};

export const executeContractFunction = async (
  contractId: string,
  functionName: string,
  parameters?: any[],
  gas: number = 100000
): Promise<any> => {
  try {
    const contractExecTx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(gas)
      .setFunction(functionName, new ContractFunctionParameters());

    // Add parameters if provided
    if (parameters) {
      // This is a simplified version - in practice you'd need to handle different parameter types
      parameters.forEach((param, index) => {
        if (typeof param === 'string') {
          contractExecTx.setFunction(functionName, new ContractFunctionParameters().addString(param));
        }
        // Add more parameter type handling as needed
      });
    }

    const contractExecTxResponse = await contractExecTx.execute(client);
    const contractExecReceipt = await contractExecTxResponse.getReceipt(client);

    logger.info('Contract function executed', {
      contractId,
      functionName,
      transactionId: contractExecTxResponse.transactionId?.toString()
    });

    return {
      transactionId: contractExecTxResponse.transactionId?.toString(),
      status: contractExecReceipt.status.toString()
    };
  } catch (error) {
    logger.error('Failed to execute contract function:', error);
    throw error;
  }
};

export const recordTransaction = async (transactionData: {
  transactionId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  memo?: string;
  userId: string;
}) => {
  try {
    const db = getDatabase();
    
    // Store transaction record in database
    // Note: You would need to create a Transaction model in your Prisma schema
    logger.info('Transaction recorded', transactionData);
    
    return transactionData.transactionId;
  } catch (error) {
    logger.error('Failed to record transaction:', error);
    throw error;
  }
};
