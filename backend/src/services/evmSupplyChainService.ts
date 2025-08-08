import { contracts, getSigner } from "./evmContracts.js";
import { logger } from "../utils/logger.js";

function requireSigner() {
  const signer = getSigner();
  if (!signer) {
    throw new Error(
      "No ECDSA signer configured for EVM operations. Set HEDERA_ECDSA_PRIVATE_KEY in backend environment to the private key of the account that deployed the contracts (carbon credit contract owner)."
    );
  }
  return signer;
}

export async function registerBusiness(
  businessId: string,
  name: string,
  ownerName: string
) {
  const signer = requireSigner();
  const tx = await contracts.supplyChain
    .connect(signer)
    .registerBusiness(businessId, name, ownerName);
  const receipt = await tx.wait();
  logger.info("EVM registerBusiness", {
    businessId,
    tx: receipt.transactionHash,
  });
  return receipt.transactionHash;
}

export async function registerProduct(params: {
  productId: string;
  name: string;
  businessId: string;
  batchNumber: string;
  manufacturedDate: number;
  expiryDate: number;
  originalPrice: string | number;
  metadata: string;
}) {
  const signer = requireSigner();
  const {
    productId,
    name,
    businessId,
    batchNumber,
    manufacturedDate,
    expiryDate,
    originalPrice,
    metadata,
  } = params;
  const tx = await contracts.supplyChain
    .connect(signer)
    .registerProduct(
      productId,
      name,
      businessId,
      batchNumber,
      manufacturedDate,
      expiryDate,
      originalPrice,
      metadata
    );
  const receipt = await tx.wait();
  logger.info("EVM registerProduct", {
    productId,
    tx: receipt.transactionHash,
  });
  return receipt.transactionHash;
}

export async function updateProductPrice(
  productId: string,
  newPrice: string | number,
  discount: number
) {
  const signer = requireSigner();
  const tx = await contracts.supplyChain
    .connect(signer)
    .updateProductPrice(productId, newPrice, discount);
  const receipt = await tx.wait();
  logger.info("EVM updateProductPrice", {
    productId,
    tx: receipt.transactionHash,
  });
  return receipt.transactionHash;
}

export async function mintCarbonCredit(params: {
  to?: string;
  amount: string | number;
  projectId: string;
  metadataURI: string;
}) {
  const signer = requireSigner();
  const to = params.to || (await signer.getAddress());
  const tx = await contracts.carbon
    .connect(signer)
    .mintCredit(to, params.amount, params.projectId, params.metadataURI);
  const receipt = await tx.wait();
  logger.info("EVM mintCarbonCredit", {
    tokenIdEvent: receipt.logs.length,
    tx: receipt.transactionHash,
  });
  return receipt.transactionHash;
}

export async function retireCarbonCredit(tokenId: number) {
  const signer = requireSigner();
  const tx = await contracts.carbon.connect(signer).retire(tokenId);
  const receipt = await tx.wait();
  logger.info("EVM retireCarbonCredit", {
    tokenId,
    tx: receipt.transactionHash,
  });
  return receipt.transactionHash;
}

export async function getPlatformStats() {
  const stats = await contracts.supplyChain.getPlatformStats();
  return {
    totalProducts: stats[0].toString(),
    totalBusinesses: stats[1].toString(),
    totalTransactions: stats[2].toString(),
  };
}

export async function getAllProductIds(): Promise<string[]> {
  return await contracts.supplyChain.getAllProductIds();
}

export async function getAllBusinessIds(): Promise<string[]> {
  return await contracts.supplyChain.getAllBusinessIds();
}

export async function getOnChainProduct(productId: string) {
  const data = await contracts.supplyChain.getProduct(productId);
  return {
    productId,
    name: data[0],
    businessId: data[1],
    originalPrice: data[2].toString(),
    currentPrice: data[3].toString(),
    discount: Number(data[4]),
    status: Number(data[5]),
    expiryDate: Number(data[6]),
    metadata: data[7],
  };
}

export async function getOnChainBusiness(businessId: string) {
  const data = await contracts.supplyChain.getBusiness(businessId);
  return {
    businessId,
    name: data[0],
    ownerName: data[1],
    verified: data[2],
    registrationDate: Number(data[3]),
    totalProducts: Number(data[4]),
  };
}

export async function createTransaction(
  transactionId: string,
  productId: string,
  buyerId: string,
  amount: string | number
) {
  const signer = requireSigner();
  const tx = await contracts.supplyChain
    .connect(signer)
    .createTransaction(transactionId, productId, buyerId, amount);
  const receipt = await tx.wait();
  logger.info("EVM createTransaction", {
    transactionId,
    tx: receipt.transactionHash,
  });
  return receipt.transactionHash;
}

export async function completeTransaction(transactionId: string) {
  const signer = requireSigner();
  const tx = await contracts.supplyChain
    .connect(signer)
    .completeTransaction(transactionId);
  const receipt = await tx.wait();
  logger.info("EVM completeTransaction", {
    transactionId,
    tx: receipt.transactionHash,
  });
  return receipt.transactionHash;
}
