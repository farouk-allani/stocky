// Demo Hedera Wallet Service - Shows real MetaMask interface but simulates successful results
// This triggers actual MetaMask popups for demo recording while ensuring success

export interface ProductRegistrationData {
  businessId: string;
  productId: string;
  name: string;
  category: string;
  originalPrice: number;
  weightInGrams: number;
  expiryDate: string;
  isOrganic: boolean;
}

export interface CarbonCreditData {
  businessId: string;
  productId: string;
  co2Saved: number;
  wasteReduced: number;
}

export interface TransactionResult {
  transactionHash: string;
  hederaTransactionId: string;
  blockNumber: number;
  gasUsed: string;
}

export interface CarbonCreditResult extends TransactionResult {
  carbonCreditTokenId: string;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isMetaMask?: boolean;
    };
  }
}

class DemoHederaWalletService {
  private connected = false;
  private walletAddress: string | null = null;

  // Check if MetaMask is installed
  isMetaMaskInstalled(): boolean {
    return typeof window !== "undefined" && window.ethereum?.isMetaMask;
  }

  // Real MetaMask connection with actual popup
  async connectWallet(): Promise<{ address: string; network: string }> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error("MetaMask is not installed");
    }

    try {
      // This triggers the actual MetaMask connection popup
      const accounts = await window.ethereum!.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      this.connected = true;
      this.walletAddress = accounts[0];

      return {
        address: this.walletAddress,
        network: "Hedera Testnet",
      };
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error("User rejected the connection request");
      }
      throw error;
    }
  }

  async disconnectWallet(): Promise<void> {
    this.connected = false;
    this.walletAddress = null;
  }

  isConnected(): boolean {
    return this.connected;
  }

  getWalletAddress(): string | null {
    return this.walletAddress;
  }

  // Real MetaMask transaction that shows popup but we control the result
  async sendRealMetaMaskTransaction(value: string = "0x0"): Promise<any> {
    if (!this.isMetaMaskInstalled() || !this.connected) {
      throw new Error("MetaMask not connected");
    }

    try {
      // This triggers the actual MetaMask transaction popup
      const txHash = await window.ethereum!.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: this.walletAddress,
            to: this.walletAddress, // Send to self for demo
            value: value, // Small amount for demo
            gas: "0x5208", // 21000 gas
          },
        ],
      });

      return txHash;
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error("User rejected the transaction");
      }
      // For demo: Even if transaction fails, we'll return success
      console.log("Transaction failed but continuing for demo:", error);
      return `0x${Math.random().toString(16).slice(2)}${Math.random()
        .toString(16)
        .slice(2)}`;
    }
  }

  // Product registration with real MetaMask popup
  async registerProduct(
    data: ProductRegistrationData
  ): Promise<TransactionResult> {
    if (!this.connected) {
      throw new Error("Wallet not connected");
    }

    try {
      // Show real MetaMask transaction popup
      const txHash = await this.sendRealMetaMaskTransaction("0x2386f26fc10000"); // 0.01 ETH equivalent

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Always return success for demo
      const mockHederaId = `0.0.${Math.floor(
        Math.random() * 1000000
      )}-${Date.now()}`;

      return {
        transactionHash: txHash,
        hederaTransactionId: mockHederaId,
        blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
        gasUsed: (Math.random() * 0.1 + 0.05).toFixed(4),
      };
    } catch (error: any) {
      if (error.message.includes("rejected")) {
        throw error; // Let user rejection bubble up
      }

      // For demo: Even if transaction fails, return success
      console.log(
        "Product registration failed but continuing for demo:",
        error
      );
      await new Promise((resolve) => setTimeout(resolve, 1500));

      return {
        transactionHash: `0x${Math.random()
          .toString(16)
          .slice(2)}${Math.random().toString(16).slice(2)}`,
        hederaTransactionId: `0.0.${Math.floor(
          Math.random() * 1000000
        )}-${Date.now()}`,
        blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
        gasUsed: (Math.random() * 0.1 + 0.05).toFixed(4),
      };
    }
  }

  // Carbon credit minting with real MetaMask popup
  async mintCarbonCredit(data: CarbonCreditData): Promise<CarbonCreditResult> {
    if (!this.connected) {
      throw new Error("Wallet not connected");
    }

    try {
      // Show real MetaMask transaction popup
      const txHash = await this.sendRealMetaMaskTransaction(
        "0x1bc16d674ec80000"
      ); // 0.02 ETH equivalent

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1800));

      // Always return success for demo
      const mockHederaId = `0.0.${Math.floor(
        Math.random() * 1000000
      )}-${Date.now()}`;
      const mockTokenId = Math.floor(Math.random() * 10000) + 1000;

      return {
        transactionHash: txHash,
        hederaTransactionId: mockHederaId,
        blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
        gasUsed: (Math.random() * 0.08 + 0.03).toFixed(4),
        carbonCreditTokenId: mockTokenId.toString(),
      };
    } catch (error: any) {
      if (error.message.includes("rejected")) {
        throw error; // Let user rejection bubble up
      }

      // For demo: Even if transaction fails, return success
      console.log(
        "Carbon credit minting failed but continuing for demo:",
        error
      );
      await new Promise((resolve) => setTimeout(resolve, 1200));

      return {
        transactionHash: `0x${Math.random()
          .toString(16)
          .slice(2)}${Math.random().toString(16).slice(2)}`,
        hederaTransactionId: `0.0.${Math.floor(
          Math.random() * 1000000
        )}-${Date.now()}`,
        blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
        gasUsed: (Math.random() * 0.08 + 0.03).toFixed(4),
        carbonCreditTokenId: Math.floor(
          Math.random() * 10000 + 1000
        ).toString(),
      };
    }
  }

  // Test transaction with real MetaMask popup
  async sendTestTransaction(): Promise<TransactionResult> {
    if (!this.connected) {
      throw new Error("Wallet not connected");
    }

    try {
      // Show real MetaMask transaction popup
      const txHash = await this.sendRealMetaMaskTransaction("0x38d7ea4c68000"); // Very small amount

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1200));

      return {
        transactionHash: txHash,
        hederaTransactionId: `0.0.${Math.floor(
          Math.random() * 1000000
        )}-${Date.now()}`,
        blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
        gasUsed: "0.0001",
      };
    } catch (error: any) {
      if (error.message.includes("rejected")) {
        throw error; // Let user rejection bubble up
      }

      // For demo: Even if transaction fails, return success
      console.log("Test transaction failed but continuing for demo:", error);
      await new Promise((resolve) => setTimeout(resolve, 800));

      return {
        transactionHash: `0x${Math.random()
          .toString(16)
          .slice(2)}${Math.random().toString(16).slice(2)}`,
        hederaTransactionId: `0.0.${Math.floor(
          Math.random() * 1000000
        )}-${Date.now()}`,
        blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
        gasUsed: "0.0001",
      };
    }
  }
}

// Export singleton instance
export const demoHederaWallet = new DemoHederaWalletService();
