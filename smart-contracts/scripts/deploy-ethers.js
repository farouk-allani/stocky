const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const contracts = [
    "Minimal",
    "StockySimple",
    "StockySupplyChain",
    "StockyPayments",
    "StockyCarbonCredits",
  ]; // order simple->complex
  const deployed = {
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
  };

  for (const name of contracts) {
    if (!fs.existsSync(`contracts/${name}.sol`)) continue;
    console.log(`\nDeploying ${name} ...`);
    const Factory = await hre.ethers.getContractFactory(name);
    const instance = await Factory.deploy();
    await instance.deployed();
    console.log(`${name} deployed at ${instance.address}`);
    deployed[name] = instance.address;
  }

  fs.writeFileSync(
    "deployed-contracts-ethers.json",
    JSON.stringify(deployed, null, 2)
  );
  console.log("\nSaved addresses to deployed-contracts-ethers.json");
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { main };
