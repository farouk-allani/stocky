import { ethers } from "ethers";

// Hedera testnet RPC
const HEDERA_RPC = "https://testnet.hashio.io/api";
const HEDERA_CHAIN_ID = 296; // decimal

// Deployed contract addresses (sync with backend config/contracts.ts)
export const CONTRACT_ADDRESSES = {
  SUPPLY_CHAIN: "0x302B95D409e5A375F7fEBf9D982699560ede6521",
  CARBON: "0x3Ce070053BA60E9183e4943579Cb905E3f1B4850",
};

// Minimal ABIs (only required functions for UI)
const SUPPLY_CHAIN_ABI = [
  // business
  "function registerBusiness(string businessId, string name, string ownerName) public",
  "function getBusiness(string businessId) view returns (string name, string ownerName, bool verified, uint256 registrationDate, uint256 totalProducts)",
  // product
  "function registerProduct(string productId, string name, string businessId, string batchNumber, uint256 manufacturedDate, uint256 expiryDate, uint256 originalPrice, string metadata) public",
  "function updateProductPrice(string productId, uint256 newPrice, uint8 discount) public",
  "function getProduct(string productId) view returns (string name, string businessId, uint256 originalPrice, uint256 currentPrice, uint8 discount, uint8 status, uint256 expiryDate, string metadata)",
  "function getAllProductIds() view returns (string[] memory)",
  "function getAllBusinessIds() view returns (string[] memory)",
  // transactions
  "function createTransaction(string transactionId, string productId, string buyerId, uint256 amount) public",
  "function completeTransaction(string transactionId) public",
  "function getTransaction(string transactionId) view returns (string productId, string buyerId, string sellerId, uint256 amount, uint256 timestamp, uint8 status)",
  // stats
  "function getPlatformStats() view returns (uint256 totalProductsCount, uint256 totalBusinessesCount, uint256 totalTransactionsCount)",
];

const CARBON_ABI = [
  "function mintCredit(address to, uint256 amount, string projectId, string metadataURI) public returns (uint256)",
  "function retire(uint256 tokenId) public",
  "function tokenURI(uint256 tokenId) view returns (string)",
];

export interface RegisterProductInput {
  businessId: string;
  productId: string;
  name: string;
  batchNumber?: string;
  manufacturedDate?: number; // seconds
  expiryDate: number; // seconds
  originalPrice: string | number; // wei or number (converted to wei)
  metadata?: string; // JSON string
}

class RealHederaWalletService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private supplyChain: ethers.Contract | null = null;
  private carbon: ethers.Contract | null = null;

  isMetaMaskInstalled(): boolean {
    return typeof window !== "undefined" && !!(window as any).ethereum;
  }

  private async ensureNetwork() {
    if (!this.isMetaMaskInstalled()) throw new Error("MetaMask not installed");
    const ethereum = (window as any).ethereum;
    const chainIdHex = "0x" + HEDERA_CHAIN_ID.toString(16);
    const current = await ethereum.request({ method: "eth_chainId" });
    if (current !== chainIdHex) {
      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        });
      } catch (e: any) {
        if (e.code === 4902) {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: chainIdHex,
                chainName: "Hedera Testnet",
                nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 18 },
                rpcUrls: [HEDERA_RPC],
                blockExplorerUrls: ["https://hashscan.io/testnet"],
              },
            ],
          });
        } else throw e;
      }
    }
  }

  async connectWallet(): Promise<{ address: string; balance: string }> {
    if (!this.isMetaMaskInstalled()) throw new Error("MetaMask not installed");
    await this.ensureNetwork();
    this.provider = new ethers.BrowserProvider(
      (window as any).ethereum,
      HEDERA_CHAIN_ID
    );
    await this.provider.send("eth_requestAccounts", []);
    this.signer = await this.provider.getSigner();
    this.supplyChain = new ethers.Contract(
      CONTRACT_ADDRESSES.SUPPLY_CHAIN,
      SUPPLY_CHAIN_ABI,
      this.signer
    );
    this.carbon = new ethers.Contract(
      CONTRACT_ADDRESSES.CARBON,
      CARBON_ABI,
      this.signer
    );
    const address = await this.signer.getAddress();
    const bal = await this.provider.getBalance(address);
    return { address, balance: ethers.formatEther(bal) };
  }

  getAddress(): Promise<string | null> {
    if (!this.signer) return Promise.resolve(null);
    return this.signer.getAddress();
  }

  async getPlatformStats() {
    if (!this.supplyChain) throw new Error("Not connected");
    const stats = await this.supplyChain.getPlatformStats();
    return {
      totalProducts: stats[0].toString(),
      totalBusinesses: stats[1].toString(),
      totalTransactions: stats[2].toString(),
    };
  }

  async ensureBusinessRegistered(
    businessId: string,
    name: string,
    ownerName: string
  ) {
    if (!this.supplyChain) throw new Error("Not connected");
    const b = await this.supplyChain.getBusiness(businessId);
    // If name empty => not registered
    if (!b[0] || (typeof b[0] === "string" && b[0].length === 0)) {
      const tx = await this.supplyChain.registerBusiness(
        businessId,
        name,
        ownerName
      );
      await tx.wait();
      return { registered: true, txHash: tx.hash };
    }
    return { registered: false };
  }

  async registerProduct(input: RegisterProductInput) {
    if (!this.supplyChain) throw new Error("Not connected");
    const manufactured =
      input.manufacturedDate || Math.floor(Date.now() / 1000);
    const originalPriceWei =
      typeof input.originalPrice === "string" ||
      typeof input.originalPrice === "number"
        ? ethers.toBigInt(input.originalPrice.toString())
        : input.originalPrice;
    const tx = await this.supplyChain.registerProduct(
      input.productId,
      input.name,
      input.businessId,
      input.batchNumber || "batch-1",
      manufactured,
      input.expiryDate,
      originalPriceWei,
      input.metadata || ""
    );
    const receipt = await tx.wait();
    return { txHash: tx.hash, blockNumber: receipt.blockNumber };
  }

  async mintCarbonCredit(
    co2Amount: number,
    projectId: string,
    metadataURI = ""
  ) {
    if (!this.carbon || !this.signer) throw new Error("Not connected");
    const to = await this.signer.getAddress();
    const tx = await this.carbon.mintCredit(
      to,
      co2Amount,
      projectId,
      metadataURI
    );
    const receipt = await tx.wait();
    return { txHash: tx.hash, blockNumber: receipt.blockNumber };
  }

  async createTransaction(
    transactionId: string,
    productId: string,
    buyerId: string,
    amount: number | bigint | string
  ) {
    if (!this.supplyChain) throw new Error("Not connected");
    const tx = await this.supplyChain.createTransaction(
      transactionId,
      productId,
      buyerId,
      amount
    );
    const receipt = await tx.wait();
    return { txHash: tx.hash, blockNumber: receipt.blockNumber };
  }

  async sendHbar(to: string, hbarAmount: number) {
    if (!this.provider || !this.signer) throw new Error("Not connected");
    const value = ethers.parseEther(hbarAmount.toString());
    const tx = await this.signer.sendTransaction({ to, value });
    const receipt = await tx.wait();
    return { txHash: tx.hash, blockNumber: receipt.blockNumber };
  }

  async completeTransaction(transactionId: string) {
    if (!this.supplyChain) throw new Error("Not connected");
    const tx = await this.supplyChain.completeTransaction(transactionId);
    const receipt = await tx.wait();
    return { txHash: tx.hash, blockNumber: receipt.blockNumber };
  }

  async getProduct(productId: string) {
    if (!this.supplyChain) throw new Error("Not connected");
    const p = await this.supplyChain.getProduct(productId);
    return {
      productId,
      name: p[0],
      businessId: p[1],
      originalPrice: p[2].toString(),
      currentPrice: p[3].toString(),
      discount: Number(p[4]),
      status: Number(p[5]),
      expiryDate: Number(p[6]),
      metadata: p[7],
    };
  }
}

export const realHederaWallet = new RealHederaWalletService();
export type RealHederaWallet = typeof realHederaWallet;
