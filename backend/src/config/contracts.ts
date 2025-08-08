import dotenv from "dotenv";
dotenv.config();

export const CONTRACTS = {
  MINIMAL:
    process.env.CONTRACT_MINIMAL_ADDRESS ||
    "0x43bc26D6f6B8918380ae971CF3222D36637aF8A4",
  STOCKY_SIMPLE:
    process.env.CONTRACT_STOCKY_SIMPLE_ADDRESS ||
    "0xcAb91B59F62086B4Cb74a5ce4CDABC01F92E0eB2",
  SUPPLY_CHAIN:
    process.env.CONTRACT_SUPPLY_CHAIN_ADDRESS ||
    "0x302B95D409e5A375F7fEBf9D982699560ede6521",
  PAYMENTS:
    process.env.CONTRACT_PAYMENTS_ADDRESS ||
    "0x452180F7267BA041a6480a0Df5Daf2F8380e35C3",
  CARBON:
    process.env.CONTRACT_CARBON_ADDRESS ||
    "0x3Ce070053BA60E9183e4943579Cb905E3f1B4850",
};

export const HEDERA_JSON_RPC =
  process.env.HEDERA_JSON_RPC || "https://testnet.hashio.io/api";
export const HEDERA_ECDSA_PRIVATE_KEY =
  process.env.HEDERA_ECDSA_PRIVATE_KEY || ""; // private key (signer)
