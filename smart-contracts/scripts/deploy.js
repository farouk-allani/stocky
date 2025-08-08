// Hedera SDK deployment for multiple contracts compiled with Hardhat
const {
  Client,
  ContractCreateTransaction,
  ContractCreateFlow,
  FileCreateTransaction,
  FileAppendTransaction,
  PrivateKey,
  AccountId,
  Hbar,
} = require("@hashgraph/sdk");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const operatorId = process.env.HEDERA_ACCOUNT_ID;
const operatorKeyRaw = process.env.HEDERA_PRIVATE_KEY;
if (!operatorId || !operatorKeyRaw) {
  console.error("Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY in .env");
  process.exit(1);
}

function parsePrivateKey(raw) {
  const r = raw.trim();
  // Force DER ED25519 usage
  try {
    return PrivateKey.fromStringDer(r);
  } catch (e) {
    // fallback to generic
    return PrivateKey.fromString(r);
  }
}

let operatorKey;
try {
  operatorKey = parsePrivateKey(operatorKeyRaw.trim());
} catch (e) {
  console.error("Private key parse error:", e.message);
  process.exit(1);
}

const client = Client.forTestnet().setOperator(
  AccountId.fromString(operatorId),
  operatorKey
);
client.setRequestTimeout(60000);

// Map contract name to artifact (Hardhat output in artifacts/contracts/<Name>.sol/<Name>.json)
// Adjust list to deploy progressively. Start with simplest to validate key/signature.
let contractsToDeploy = [
  { name: "Minimal", file: "Minimal.sol" },
  { name: "StockySimple", file: "StockySimple.sol" },
  { name: "StockySupplyChain", file: "StockySupplyChain.sol" },
  { name: "StockyPayments", file: "StockyPayments.sol" },
  { name: "StockyCarbonCredits", file: "StockyCarbonCredits.sol" },
];

// Allow limiting via env (e.g., DEPLOY_ONLY=StockySimple)
if (process.env.DEPLOY_ONLY) {
  contractsToDeploy = contractsToDeploy.filter(
    (c) => c.name.toLowerCase() === process.env.DEPLOY_ONLY.toLowerCase()
  );
  if (contractsToDeploy.length === 0) {
    console.error("DEPLOY_ONLY specified but no matching contract.");
    process.exit(1);
  }
}

function loadBytecode(contractFile, contractName) {
  // Hardhat artifacts path assumption
  const artifactPath = path.join(
    __dirname,
    `../artifacts/contracts/${contractFile}/${contractName}.json`
  );
  if (!fs.existsSync(artifactPath)) {
    throw new Error(
      `Artifact not found for ${contractName}. Run 'npm run compile' first. (${artifactPath})`
    );
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  return artifact.bytecode; // 0x prefixed
}

async function deployHedera(bytecodeHex, name) {
  console.log(`\nDeploying ${name} ...`);
  // Remove 0x for Hedera FileCreateTransaction
  const bytecode = bytecodeHex.startsWith("0x")
    ? bytecodeHex.substring(2)
    : bytecodeHex;
  console.log(`  Bytecode hex length: ${bytecode.length}`);
  const byteBuf = Buffer.from(bytecode, "hex");
  console.log(`  Bytecode bytes: ${byteBuf.length}`);

  try {
    // Hedera file chunking
    const CHUNK_SIZE = 3500; // bytes per transaction (safe under 4KB limit)
    let offset = 0;
    // First chunk
    const firstChunk = byteBuf.slice(0, CHUNK_SIZE);
    const fileCreateTx = await new FileCreateTransaction()
      .setKeys([operatorKey.publicKey])
      .setContents(firstChunk)
      .setMaxTransactionFee(new Hbar(5))
      .execute(client);
    const fileCreateRx = await fileCreateTx.getReceipt(client);
    const fileId = fileCreateRx.fileId;
    console.log(`  Bytecode file: ${fileId}`);
    offset += firstChunk.length;
    while (offset < byteBuf.length) {
      const chunk = byteBuf.slice(offset, offset + CHUNK_SIZE);
      const appendTx = await new FileAppendTransaction()
        .setFileId(fileId)
        .setContents(chunk)
        .setMaxTransactionFee(new Hbar(2))
        .execute(client);
      await appendTx.getReceipt(client);
      offset += chunk.length;
      process.stdout.write(`  Appended ${offset}/${byteBuf.length} bytes\r`);
    }
    if (byteBuf.length > CHUNK_SIZE) console.log("  All chunks appended.");

    const createTx = await new ContractCreateTransaction()
      .setBytecodeFileId(fileId)
      .setGas(2_000_000)
      .setMaxTransactionFee(new Hbar(30))
      .execute(client);
    const createReceipt = await createTx.getReceipt(client);
    const contractId = createReceipt.contractId.toString();
    console.log(`  Contract ID: ${contractId}`);
    console.log(
      `  Explorer: https://hashscan.io/testnet/contract/${contractId}`
    );
    return contractId;
  } catch (e) {
    console.warn(
      `  Primary method failed (${e.message}), trying ContractCreateFlow...`
    );
    const flow = new ContractCreateFlow()
      .setGas(2_000_000)
      .setBytecode(byteBuf);
    const flowResp = await flow.execute(client);
    const receipt = await flowResp.getReceipt(client);
    const contractId = receipt.contractId.toString();
    console.log(`  Contract ID (flow): ${contractId}`);
    console.log(
      `  Explorer: https://hashscan.io/testnet/contract/${contractId}`
    );
    return contractId;
  }
}

async function main() {
  const results = {
    network: "hedera-testnet",
    deployedAt: new Date().toISOString(),
  };
  for (const c of contractsToDeploy) {
    try {
      console.log(`\n=== ${c.name} ===`);
      const bytecode = loadBytecode(c.file, c.name);
      const id = await deployHedera(bytecode, c.name);
      results[c.name] = id;
    } catch (e) {
      console.error(`Failed deploying ${c.name}:`, e.stack || e.message);
      // Stop early if the simplest contract fails
      if (c.name === "StockySimple") {
        console.error(
          "Aborting subsequent deployments until key/network issue resolved."
        );
        break;
      }
    }
  }
  fs.writeFileSync(
    path.join(__dirname, "../deployed-contracts.json"),
    JSON.stringify(results, null, 2)
  );
  console.log("\nDeployment summary saved to deployed-contracts.json");
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { main };
