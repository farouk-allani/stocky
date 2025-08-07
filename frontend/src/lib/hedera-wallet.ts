import { ethers } from "ethers";

// Hedera Testnet configuration
const HEDERA_TESTNET_CONFIG = {
  chainId: "0x128", // 296 in hex (Hedera testnet)
  chainName: "Hedera Testnet",
  nativeCurrency: {
    name: "HBAR",
    symbol: "HBAR",
    decimals: 18,
  },
  rpcUrls: ["https://testnet.hashio.io/api"],
  blockExplorerUrls: ["https://hashscan.io/testnet"],
};

// Mock Stocky smart contract ABI for product registration
const STOCKY_CONTRACT_ABI = [
  {
    inputs: [
      { name: "businessId", type: "string" },
      { name: "productId", type: "string" },
      { name: "productName", type: "string" },
      { name: "category", type: "string" },
      { name: "originalPrice", type: "uint256" },
      { name: "weightInGrams", type: "uint256" },
      { name: "expiryTimestamp", type: "uint256" },
      { name: "isOrganic", type: "bool" },
    ],
    name: "registerProduct",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "businessId", type: "string" },
      { name: "productId", type: "string" },
      { name: "co2Saved", type: "uint256" },
      { name: "wasteReduced", type: "uint256" },
      { name: "guardianTransactionId", type: "string" },
    ],
    name: "mintCarbonCredit",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Mock contract address (in real deployment, this would be actual deployed contract)
const STOCKY_CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890";

export class HederaWalletService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;

  /**
   * Check if MetaMask is installed
   */
  isMetaMaskInstalled(): boolean {
    return (
      typeof window !== "undefined" && typeof window.ethereum !== "undefined"
    );
  }

  /**
   * Add Hedera testnet to MetaMask
   */
  async addHederaNetwork(): Promise<boolean> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error("MetaMask is not installed");
    }

    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [HEDERA_TESTNET_CONFIG],
      });
      return true;
    } catch (error) {
      console.error("Failed to add Hedera network:", error);
      return false;
    }
  }

  /**
   * Switch to Hedera testnet
   */
  async switchToHederaNetwork(): Promise<boolean> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error("MetaMask is not installed");
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: HEDERA_TESTNET_CONFIG.chainId }],
      });
      return true;
    } catch (error: any) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        return await this.addHederaNetwork();
      }
      console.error("Failed to switch to Hedera network:", error);
      return false;
    }
  }

  /**
   * Connect to MetaMask wallet
   */
  async connectWallet(): Promise<{ address: string; balance: string }> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error(
        "MetaMask is not installed. Please install MetaMask to continue."
      );
    }

    try {
      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Initialize provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Initialize contract
      this.contract = new ethers.Contract(
        STOCKY_CONTRACT_ADDRESS,
        STOCKY_CONTRACT_ABI,
        this.signer
      );

      // Switch to Hedera network
      await this.switchToHederaNetwork();

      // Get wallet info
      const address = await this.signer.getAddress();
      const balance = await this.provider.getBalance(address);
      const balanceInHbar = ethers.formatEther(balance);

      return {
        address,
        balance: balanceInHbar,
      };
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  }

  /**
   * Register product on Hedera blockchain (with real MetaMask transaction)
   */
  async registerProduct(productData: {
    businessId: string;
    productId: string;
    name: string;
    category: string;
    originalPrice: number;
    weightInGrams: number;
    expiryDate: string;
    isOrganic: boolean;
  }): Promise<{
    transactionHash: string;
    hederaTransactionId: string;
    blockNumber: number;
    gasUsed: string;
  }> {
    if (!this.contract || !this.signer) {
      throw new Error(
        "Wallet not connected. Please connect your wallet first."
      );
    }

    try {
      // Convert price to wei (HBAR has 18 decimals like ETH)
      const priceInWei = ethers.parseEther(
        productData.originalPrice.toString()
      );
      const expiryTimestamp = Math.floor(
        new Date(productData.expiryDate).getTime() / 1000
      );

      console.log("🔗 Preparing Hedera transaction...");
      console.log("Product data:", productData);

      // Create actual transaction data for MetaMask
      const txData = this.contract.interface.encodeFunctionData(
        "registerProduct",
        [
          productData.businessId,
          productData.productId,
          productData.name,
          productData.category,
          priceInWei,
          productData.weightInGrams,
          expiryTimestamp,
          productData.isOrganic,
        ]
      );

      // Prepare transaction object
      const transaction = {
        to: STOCKY_CONTRACT_ADDRESS,
        data: txData,
        value: "0x0", // No HBAR value sent
        gasLimit: "0x5208", // 21000 in hex
      };

      // This will trigger MetaMask popup for real transaction signing
      const txResponse = await this.signer.sendTransaction(transaction);

      console.log("Transaction sent:", txResponse.hash);
      console.log("Waiting for confirmation...");

      // Wait for transaction to be mined
      const receipt = await txResponse.wait();

      // Generate Hedera-style transaction ID
      const hederaTransactionId = `0.0.${Math.floor(
        Math.random() * 999999
      )}@${Date.now()}.${Math.floor(Math.random() * 999999999)}`;

      return {
        transactionHash: txResponse.hash,
        hederaTransactionId,
        blockNumber: receipt?.blockNumber || 0,
        gasUsed: ethers.formatEther(receipt?.gasUsed || "0"),
      };
    } catch (error: any) {
      console.error("Failed to register product:", error);

      // Handle user rejection
      if (
        error.code === 4001 ||
        error.message.includes("rejected") ||
        error.message.includes("denied")
      ) {
        throw new Error("Transaction cancelled by user");
      }

      // Handle insufficient funds
      if (
        error.code === -32000 ||
        error.message.includes("insufficient funds")
      ) {
        throw new Error("Insufficient HBAR balance for gas fees");
      }

      throw error;
    }
  }

  /**
   * Mint carbon credit for food waste reduction (with real MetaMask transaction)
   */
  async mintCarbonCredit(data: {
    businessId: string;
    productId: string;
    co2Saved: number;
    wasteReduced: number;
  }): Promise<{
    transactionHash: string;
    hederaTransactionId: string;
    carbonCreditTokenId: number;
    blockNumber: number;
  }> {
    if (!this.contract || !this.signer) {
      throw new Error(
        "Wallet not connected. Please connect your wallet first."
      );
    }

    try {
      const guardianTransactionId = `guardian-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      console.log("🌱 Preparing carbon credit minting transaction...");

      // Create actual transaction data for carbon credit minting
      const txData = this.contract.interface.encodeFunctionData(
        "mintCarbonCredit",
        [
          data.businessId,
          data.productId,
          data.co2Saved.toString(),
          data.wasteReduced.toString(),
          guardianTransactionId,
        ]
      );

      // Prepare transaction object
      const transaction = {
        to: STOCKY_CONTRACT_ADDRESS,
        data: txData,
        value: "0x0", // No HBAR value sent
        gasLimit: "0x7530", // 30000 in hex (more gas for minting)
      };

      // This will trigger MetaMask popup for carbon credit minting
      const txResponse = await this.signer.sendTransaction(transaction);

      console.log("Carbon credit transaction sent:", txResponse.hash);
      console.log("Waiting for confirmation...");

      // Wait for transaction to be mined
      const receipt = await txResponse.wait();

      // Generate mock data for demo
      const hederaTransactionId = `0.0.${Math.floor(
        Math.random() * 999999
      )}@${Date.now()}.${Math.floor(Math.random() * 999999999)}`;
      const carbonCreditTokenId = Math.floor(Math.random() * 10000) + 1;

      return {
        transactionHash: txResponse.hash,
        hederaTransactionId,
        carbonCreditTokenId,
        blockNumber: receipt?.blockNumber || 0,
      };
    } catch (error: any) {
      console.error("Failed to mint carbon credit:", error);

      // Handle user rejection
      if (
        error.code === 4001 ||
        error.message.includes("rejected") ||
        error.message.includes("denied")
      ) {
        throw new Error("Carbon credit minting cancelled by user");
      }

      // Handle insufficient funds
      if (
        error.code === -32000 ||
        error.message.includes("insufficient funds")
      ) {
        throw new Error("Insufficient HBAR balance for gas fees");
      }

      throw error;
    }
  }

  /**
   * Get wallet address
   */
  async getWalletAddress(): Promise<string | null> {
    if (!this.signer) return null;
    try {
      return await this.signer.getAddress();
    } catch {
      return null;
    }
  }

  /**
   * Get wallet balance in HBAR
   */
  async getWalletBalance(): Promise<string | null> {
    if (!this.provider || !this.signer) return null;
    try {
      const address = await this.signer.getAddress();
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch {
      return null;
    }
  }

  /**
   * Simple HBAR transfer to test MetaMask integration
   */
  async sendTestTransaction(): Promise<{
    transactionHash: string;
    blockNumber: number;
  }> {
    if (!this.signer) {
      throw new Error(
        "Wallet not connected. Please connect your wallet first."
      );
    }

    try {
      // Send a small amount of HBAR to the same address (0.001 HBAR)
      const transaction = {
        to: await this.signer.getAddress(),
        value: ethers.parseEther("0.001"), // 0.001 HBAR
        gasLimit: "0x5208", // 21000 in hex
      };

      console.log("🔗 Sending test transaction...");

      // This will definitely trigger MetaMask popup
      const txResponse = await this.signer.sendTransaction(transaction);

      console.log("Test transaction sent:", txResponse.hash);
      console.log("Waiting for confirmation...");

      // Wait for transaction to be mined
      const receipt = await txResponse.wait();

      return {
        transactionHash: txResponse.hash,
        blockNumber: receipt?.blockNumber || 0,
      };
    } catch (error: any) {
      console.error("Test transaction failed:", error);

      if (error.code === 4001 || error.message.includes("rejected")) {
        throw new Error("Transaction cancelled by user");
      }

      if (
        error.code === -32000 ||
        error.message.includes("insufficient funds")
      ) {
        throw new Error("Insufficient HBAR balance");
      }

      throw error;
    }
  }

  /**
   * Check if connected to Hedera network
   */
  async isConnectedToHedera(): Promise<boolean> {
    if (!this.provider) return false;
    try {
      const network = await this.provider.getNetwork();
      return network.chainId === BigInt(296); // Hedera testnet chain ID
    } catch {
      return false;
    }
  }
}

// Global instance
export const hederaWallet = new HederaWalletService();

// Types for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
