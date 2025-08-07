const {
  Client,
  ContractCreateTransaction,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  FileCreateTransaction,
  PrivateKey,
  AccountId,
  Hbar
} = require('@hashgraph/sdk');
const fs = require('fs');
require('dotenv').config();

// Initialize Hedera client
const client = Client.forTestnet();

// Set operator account
const operatorAccountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
const operatorPrivateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
client.setOperator(operatorAccountId, operatorPrivateKey);

async function deployContract(contractName, constructorParams = []) {
  try {
    console.log(`Deploying ${contractName}...`);
    
    // Read compiled contract bytecode
    const contractBytecode = fs.readFileSync(`./build/${contractName}.bin`, 'utf8');
    
    // Create file with contract bytecode
    const fileCreateTx = new FileCreateTransaction()
      .setContents(contractBytecode)
      .setKeys([operatorPrivateKey.publicKey])
      .setMaxTransactionFee(new Hbar(2));

    const fileCreateTxResponse = await fileCreateTx.execute(client);
    const fileCreateReceipt = await fileCreateTxResponse.getReceipt(client);
    const fileId = fileCreateReceipt.fileId;
    
    console.log(`Contract bytecode file created: ${fileId}`);

    // Create contract
    const contractCreateTx = new ContractCreateTransaction()
      .setBytecodeFileId(fileId)
      .setGas(2000000)
      .setMaxTransactionFee(new Hbar(20));
    
    // Add constructor parameters if provided
    if (constructorParams.length > 0) {
      const params = new ContractFunctionParameters();
      constructorParams.forEach(param => {
        if (typeof param === 'string') {
          params.addString(param);
        } else if (typeof param === 'number') {
          params.addUint256(param);
        } else if (typeof param === 'boolean') {
          params.addBool(param);
        }
      });
      contractCreateTx.setConstructorParameters(params);
    }

    const contractCreateTxResponse = await contractCreateTx.execute(client);
    const contractCreateReceipt = await contractCreateTxResponse.getReceipt(client);
    const contractId = contractCreateReceipt.contractId;

    console.log(`${contractName} deployed successfully!`);
    console.log(`Contract ID: ${contractId}`);
    console.log(`Explorer: https://hashscan.io/testnet/contract/${contractId}`);
    
    return contractId.toString();
    
  } catch (error) {
    console.error(`Error deploying ${contractName}:`, error);
    throw error;
  }
}

async function main() {
  try {
    console.log('Starting deployment process...');
    console.log(`Operator Account: ${operatorAccountId}`);
    
    // Deploy StockySupplyChain contract
    const supplyChainContractId = await deployContract('StockySupplyChain');
    
    // Deploy StockyPayments contract
    const paymentsContractId = await deployContract('StockyPayments');
    
    // Save contract addresses to a file
    const contractAddresses = {
      StockySupplyChain: supplyChainContractId,
      StockyPayments: paymentsContractId,
      deployedAt: new Date().toISOString(),
      network: 'testnet'
    };
    
    fs.writeFileSync('./deployed-contracts.json', JSON.stringify(contractAddresses, null, 2));
    
    console.log('\n=== Deployment Summary ===');
    console.log(`StockySupplyChain: ${supplyChainContractId}`);
    console.log(`StockyPayments: ${paymentsContractId}`);
    console.log('\nContract addresses saved to deployed-contracts.json');
    
    // Test basic functionality
    console.log('\n=== Testing Basic Functionality ===');
    await testContracts(supplyChainContractId, paymentsContractId);
    
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

async function testContracts(supplyChainId, paymentsId) {
  try {
    // Test StockySupplyChain - Get platform stats
    console.log('Testing StockySupplyChain...');
    
    const getStatsQuery = new ContractExecuteTransaction()
      .setContractId(supplyChainId)
      .setGas(100000)
      .setFunction('getPlatformStats')
      .setMaxTransactionFee(new Hbar(1));

    const getStatsResponse = await getStatsQuery.execute(client);
    console.log('✓ StockySupplyChain: getPlatformStats executed successfully');
    
    // Test StockyPayments - Get platform stats
    console.log('Testing StockyPayments...');
    
    const getPaymentStatsQuery = new ContractExecuteTransaction()
      .setContractId(paymentsId)
      .setGas(100000)
      .setFunction('getPlatformStats')
      .setMaxTransactionFee(new Hbar(1));

    const getPaymentStatsResponse = await getPaymentStatsQuery.execute(client);
    console.log('✓ StockyPayments: getPlatformStats executed successfully');
    
    console.log('\n✅ All contracts deployed and tested successfully!');
    
  } catch (error) {
    console.error('Contract testing failed:', error);
  }
}

// Run deployment
if (require.main === module) {
  main().then(() => {
    console.log('\nDeployment completed!');
    process.exit(0);
  }).catch(error => {
    console.error('Deployment script failed:', error);
    process.exit(1);
  });
}

module.exports = { deployContract, testContracts };
