import { ethers } from "ethers";
import {
  CONTRACTS,
  HEDERA_JSON_RPC,
  HEDERA_ECDSA_PRIVATE_KEY,
} from "../config/contracts.js";
import StockySimpleArtifact from "../../../smart-contracts/artifacts/contracts/StockySimple.sol/StockySimple.json" assert { type: "json" };
import StockySupplyChainArtifact from "../../../smart-contracts/artifacts/contracts/StockySupplyChain.sol/StockySupplyChain.json" assert { type: "json" };
import StockyPaymentsArtifact from "../../../smart-contracts/artifacts/contracts/StockyPayments.sol/StockyPayments.json" assert { type: "json" };
import StockyCarbonCreditsArtifact from "../../../smart-contracts/artifacts/contracts/StockyCarbonCredits.sol/StockyCarbonCredits.json" assert { type: "json" };

const provider = new ethers.providers.JsonRpcProvider(HEDERA_JSON_RPC, {
  chainId: 296,
  name: "hedera-testnet",
});
const signer = HEDERA_ECDSA_PRIVATE_KEY
  ? new ethers.Wallet(HEDERA_ECDSA_PRIVATE_KEY, provider)
  : undefined;

export const contracts = {
  stockySimple: new ethers.Contract(
    CONTRACTS.STOCKY_SIMPLE,
    StockySimpleArtifact.abi,
    signer || provider
  ),
  supplyChain: new ethers.Contract(
    CONTRACTS.SUPPLY_CHAIN,
    StockySupplyChainArtifact.abi,
    signer || provider
  ),
  payments: new ethers.Contract(
    CONTRACTS.PAYMENTS,
    StockyPaymentsArtifact.abi,
    signer || provider
  ),
  carbon: new ethers.Contract(
    CONTRACTS.CARBON,
    StockyCarbonCreditsArtifact.abi,
    signer || provider
  ),
};

export function getProvider() {
  return provider;
}
export function getSigner() {
  return signer;
}
