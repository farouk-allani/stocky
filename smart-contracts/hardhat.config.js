require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

const PRIVATE_KEY =
  process.env.HEDERA_ECDSA_PRIVATE_KEY || process.env.EVM_PRIVATE_KEY || "";
const HEDERA_RPC =
  process.env.HEDERA_JSON_RPC || "https://testnet.hashio.io/api";

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: { optimizer: { enabled: true, runs: 200 }, viaIR: true },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    hederaJsonRpc: {
      url: HEDERA_RPC,
      chainId: 296, // Hedera testnet chain ID for JSON-RPC relays (commonly 296 / 0x128)
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};
