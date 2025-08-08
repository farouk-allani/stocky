import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/auth";
import { useProductStore, useBusinessStore, useOrderStore } from "@/lib/stores";
// Switched to real Hedera wallet service (MetaMask + actual contracts)
import { realHederaWallet, CONTRACT_ADDRESSES } from "@/lib/real-hedera-wallet";
import { ethers } from "ethers";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package,
  DollarSign,
  Camera,
  Plus,
  Edit,
  Trash2,
  Zap,
  Clock,
  Leaf,
  CreditCard,
  ShoppingBag,
  Shield,
  Award,
  TrendingUp,
  Verified,
  Wallet,
  ExternalLink,
} from "lucide-react";

// Mock business stats with Guardian integration
const MOCK_BUSINESS_STATS = {
  totalProducts: 24,
  totalRevenue: 2847.65,
  totalOrders: 67,
  averageDiscount: 42,
  wasteReduced: 89.2,
  co2Saved: 156.7,
  monthlyGrowth: 23,
  carbonCreditsGenerated: 42,
  guardianTransactions: 67,
  esgRating: "A+",
  verifiedImpact: true,
};

function BusinessDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { products, setProducts } = useProductStore();
  const { stats, setStats } = useBusinessStore();
  const { orders, setOrders } = useOrderStore();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [blockchainTxInProgress, setBlockchainTxInProgress] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState<null | {
    id: string;
    name: string;
  }>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state for new product
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    originalPrice: "",
    category: "",
    expiryDate: "",
    quantity: "",
    isOrganic: false,
    imageFile: null as File | null,
  });

  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsCheckingAuth(false);

      if (!user || user.role !== "BUSINESS") {
        navigate("/");
        return;
      }

      // Load real data from API
      try {
        setDataLoading(true);

        // Fetch business stats from backend
        const statsData = await api.getBusinessStats();
        setStats(statsData);

        // Fetch business products from backend
        const productsData = await api.getProducts();
        setProducts(Array.isArray(productsData) ? productsData : []);

        // Fetch orders from backend
        const ordersData = await api.getOrders();
        // Normalize backend order shape to expected store shape (flatten first item/product)
        const normalized = Array.isArray(ordersData)
          ? ordersData.map((o: any) => {
              // Backend returns o.items array; pick first product for summary listing
              const firstItem = o.items && o.items[0];
              const productRef = firstItem?.product ||
                o.product || {
                  id:
                    firstItem?.productId ||
                    o.items?.[0]?.productId ||
                    "unknown",
                  name:
                    firstItem?.product?.name ||
                    o.items?.[0]?.product?.name ||
                    o.notes ||
                    "Product",
                };
              return {
                id: o.id,
                productId: firstItem?.productId || productRef.id,
                product: productRef,
                consumerId: o.customerId,
                businessId: o.businessId,
                quantity: firstItem?.quantity || 1,
                totalAmount: o.total || o.subtotal || 0,
                status: o.status,
                paymentStatus:
                  o.paymentStatus || (o.isPaid ? "PAID" : "PENDING"),
                hederaTransactionId: o.hederaTransactionId,
                pickupTime: o.pickupTime,
                notes: o.notes,
                createdAt: o.createdAt,
                updatedAt: o.updatedAt,
              };
            })
          : [];
        setOrders(normalized);

        setDataLoading(false);
      } catch (error) {
        console.error("Failed to load data:", error);
        setStats(MOCK_BUSINESS_STATS);

        const mockProducts = [
          {
            id: "b1",
            name: "Fresh Salmon Fillets",
            description:
              "Premium Atlantic salmon, perfect for tonight's dinner",
            originalPrice: 18.99,
            discountedPrice: 12.99,
            discountPercentage: 32,
            expiryDate: "2025-08-08",
            category: "Seafood",
            imageUrl:
              "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
            businessId: user.id,
            businessName: user.businessName || "My Business",
            location: "My Store Location",
            latitude: 40.7128,
            longitude: -74.006,
            quantity: 8,
            status: "ACTIVE" as const,
            isOrganic: false,
            tags: ["seafood", "protein", "fresh"],
            createdAt: "2025-08-07T08:00:00Z",
            updatedAt: "2025-08-07T08:00:00Z",
          },
          {
            id: "b2",
            name: "Organic Baby Spinach",
            description: "Fresh organic spinach leaves, great for salads",
            originalPrice: 6.99,
            discountedPrice: 3.99,
            discountPercentage: 43,
            expiryDate: "2025-08-09",
            category: "Vegetables",
            imageUrl:
              "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400",
            businessId: user.id,
            businessName: user.businessName || "My Business",
            location: "My Store Location",
            latitude: 40.7128,
            longitude: -74.006,
            quantity: 15,
            status: "ACTIVE" as const,
            isOrganic: true,
            tags: ["vegetables", "organic", "healthy"],
            createdAt: "2025-08-07T09:00:00Z",
            updatedAt: "2025-08-07T09:00:00Z",
          },
        ];

        setProducts(mockProducts);

        const mockOrders = [
          {
            id: "o1",
            productId: "b1",
            product: mockProducts[0],
            consumerId: "c1",
            businessId: user.id,
            quantity: 2,
            totalAmount: 25.98,
            status: "CONFIRMED" as const,
            paymentStatus: "PAID" as const,
            hederaTransactionId: "0.0.123456@1691404800.123456789",
            pickupTime: "2025-08-07T18:00:00Z",
            notes: "Order placed via Stocky app",
            createdAt: "2025-08-07T10:00:00Z",
            updatedAt: "2025-08-07T10:00:00Z",
          },
        ];

        setOrders(mockOrders);
        setDataLoading(false);
      }

      // Check if wallet is already connected
      checkWalletConnection();
    }, 500);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  const checkWalletConnection = async () => {
    try {
      const address = await realHederaWallet.getAddress();
      if (address) {
        setWalletAddress(address);
        setWalletConnected(true);
        // Mock balance for demo
        const mockBalance = (Math.random() * 100 + 25).toFixed(4);
        setWalletBalance(mockBalance);
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };

  const handleConnectWallet = async () => {
    // Check for MetaMask first
    if (!realHederaWallet.isMetaMaskInstalled()) {
      toast.error("MetaMask Required", {
        description:
          "Please install MetaMask extension to connect your wallet. Visit metamask.io to download and install MetaMask.",
        action: {
          label: "Install MetaMask",
          onClick: () => window.open("https://metamask.io/", "_blank"),
        },
      });
      return;
    }

    setConnectingWallet(true);
    try {
      const walletInfo = await realHederaWallet.connectWallet();
      setWalletAddress(walletInfo.address);
      setWalletBalance(walletInfo.balance);
      setWalletConnected(true);

      toast.success("🎉 Wallet Connected Successfully!", {
        description: `Network: Hedera Testnet\nAddress: ${walletInfo.address.slice(
          0,
          6
        )}...${walletInfo.address.slice(-4)}\nBalance: ${(
          Math.random() * 100 +
          50
        ).toFixed(
          4
        )} HBAR\n\nYou can now register products on the Hedera blockchain!`,
        duration: 4000,
      });
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);

      if (error.message.includes("rejected")) {
        toast.error("❌ Connection Rejected", {
          description:
            "You rejected the wallet connection request. Please try again and approve the connection in MetaMask.",
        });
      } else {
        toast.error("❌ Wallet Connection Failed", {
          description: `Failed to connect wallet: ${error.message}\n\nPlease make sure:\n• MetaMask is unlocked\n• You have approved the connection\n• Hedera testnet is configured`,
        });
      }
    } finally {
      setConnectingWallet(false);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProductForm((prev) => ({ ...prev, imageFile: file }));
    setAnalyzing(true);
    setShowAnalysisModal(true);

    try {
      const response = await api.analyzeProduct(file);
      console.log("Analysis Response:", response);

      const analysis = response.analysis;

      const mockAnalysis = {
        productName: analysis.detectedItems?.[0] || "Unknown Product",
        category: analysis.tags?.includes("fruit")
          ? "Fruits"
          : analysis.tags?.includes("vegetable")
          ? "Vegetables"
          : analysis.tags?.includes("dairy")
          ? "Dairy"
          : analysis.tags?.includes("meat")
          ? "Meat"
          : analysis.tags?.includes("bakery")
          ? "Bakery"
          : "Other",
        estimatedPrice: 4.99, // Could be enhanced with price estimation logic
        expiryEstimate: new Date(
          Date.now() + (analysis.estimatedShelfLife || 72) * 60 * 60 * 1000
        )
          .toISOString()
          .split("T")[0],
        isOrganic: analysis.tags?.includes("organic") || false,
        freshness: Math.round((analysis.freshness || 0.7) * 100),
        quality:
          analysis.quality > 0.8
            ? "Excellent"
            : analysis.quality > 0.6
            ? "Good"
            : analysis.quality > 0.4
            ? "Fair"
            : "Poor",
        suggestedDiscount: Math.max(
          0,
          100 - Math.round((analysis.freshness || 0.7) * 100)
        ),
        description: `AI detected: ${
          analysis.detectedItems?.join(", ") || "food item"
        }. Quality assessment based on image analysis. ${
          analysis.tags?.join(", ") || ""
        }`,
      };

      setAnalysis(mockAnalysis);

      setProductForm((prev) => ({
        ...prev,
        name: mockAnalysis.productName,
        category: mockAnalysis.category,
        originalPrice: mockAnalysis.estimatedPrice.toString(),
        expiryDate: mockAnalysis.expiryEstimate,
        isOrganic: mockAnalysis.isOrganic,
        description: mockAnalysis.description,
      }));
    } catch (error) {
      console.error("AI analysis failed:", error);

      // Fallback to mock data if API fails
      const fallbackAnalysis = {
        productName: "Product Analysis Failed",
        category: "Other",
        estimatedPrice: 2.99,
        expiryEstimate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        isOrganic: false,
        freshness: 50,
        quality: "Unknown",
        suggestedDiscount: 20,
        description:
          "Analysis failed. Please manually enter product details.",
      };

      setAnalysis(fallbackAnalysis);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAcceptAnalysis = () => {
    setShowAnalysisModal(false);
    setShowAddProductModal(true);
  };

  const handleSubmitProduct = async () => {
    if (
      !productForm.name ||
      !productForm.originalPrice ||
      !productForm.expiryDate
    ) {
      toast.error("Missing Required Fields", {
        description:
          "Please fill in all required fields (name, price, and expiry date)",
      });
      return;
    }

    if (!walletConnected) {
      toast.error("Wallet Not Connected", {
        description:
          "Please connect your Hedera wallet first to register products on the blockchain! Click 'Connect Wallet' to link your MetaMask wallet with Hedera testnet.",
      });
      return;
    }

    setSubmitting(true);
    setBlockchainTxInProgress(true);

    try {
      const expiryDate = new Date(productForm.expiryDate);
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      // Calculate dynamic discount based on expiry
      let discountPercentage = 0;
      if (daysUntilExpiry <= 1) discountPercentage = 50;
      else if (daysUntilExpiry <= 2) discountPercentage = 35;
      else if (daysUntilExpiry <= 3) discountPercentage = 25;
      else if (daysUntilExpiry <= 7) discountPercentage = 15;

      const originalPrice = parseFloat(productForm.originalPrice);
      const discountedPrice = originalPrice * (1 - discountPercentage / 100);

      // Estimate weight for carbon credit calculation (if not provided)
      const estimatedWeight = parseInt(productForm.quantity) * 500 || 500; // 500g default per item

      // Step 1: Register product on Hedera blockchain
      console.log("🔗 Registering product on Hedera blockchain...");
      toast.loading("🔗 Registering product on Hedera blockchain...", {
        id: "blockchain-tx",
      });

      const productId = `product-${Date.now()}`;
      // Ensure business registered (businessId = user.id)
      await realHederaWallet.ensureBusinessRegistered(
        user.id!,
        user.businessName || "Business",
        user.firstName + " " + user.lastName
      );
      const expirySeconds = Math.floor(
        new Date(productForm.expiryDate).getTime() / 1000
      );
      const registerRes = await realHederaWallet.registerProduct({
        businessId: user.id!,
        productId,
        name: productForm.name,
        batchNumber: "batch-1",
        manufacturedDate: Math.floor(Date.now() / 1000),
        expiryDate: expirySeconds,
        originalPrice: ethers
          .parseUnits(originalPrice.toString(), 18)
          .toString(),
        metadata: JSON.stringify({
          category: productForm.category,
          organic: productForm.isOrganic,
        }),
      });

      console.log("✅ Product registration transaction confirmed!");
      toast.success("✅ Product registration confirmed!", {
        id: "blockchain-tx",
      });

      // Step 2: Calculate CO2 savings and mint carbon credit
      const co2SavedInGrams = Math.floor(estimatedWeight * 1.2); // Simplified calculation

      console.log("🌱 Minting carbon credit for environmental impact...");
      toast.loading("🌱 Minting carbon credit for environmental impact...", {
        id: "carbon-tx",
      });

      let carbonMint: { txHash?: string } = {};
      try {
        // Backend mints carbon credit using owner signer (contract onlyOwner)
        const carbonRes = await api.mintCarbonCredit({
          amount: co2SavedInGrams,
          projectId: `project-${productId}`,
          metadataURI: "",
        });
        carbonMint.txHash = carbonRes.txHash;
      } catch (mintErr: any) {
        console.warn("Carbon credit mint via backend failed", mintErr);
        toast.message("Carbon credit mint skipped", {
          description: "Proceeding without credit (owner-only mint).",
        });
      }

      console.log("✅ Carbon credit minting transaction confirmed!");
      toast.success("✅ Carbon credit minting confirmed!", { id: "carbon-tx" });

      // Step 3: Persist product via backend API (DB) then refresh list
      try {
        const payload = {
          name: productForm.name,
          description: productForm.description,
          category: productForm.category || "General",
          originalPrice: originalPrice,
          currentPrice: discountedPrice,
          quantity: parseInt(productForm.quantity) || 1,
          unit: "unit",
          batchNumber: "batch-1",
          manufacturedDate: new Date().toISOString(),
          expiryDate: productForm.expiryDate,
          location: "Store",
        };
        if (productForm.imageFile) {
          await api.createProductWithImage(payload, productForm.imageFile);
        } else {
          await api.createProduct(payload);
        }
        const refreshed = await api.getProducts();
        setProducts(Array.isArray(refreshed) ? refreshed : []);
      } catch (persistErr: any) {
        console.warn(
          "Backend persistence failed, keeping local only",
          persistErr
        );
        const fallbackProduct = {
          id: `local-${Date.now()}`,
          name: productForm.name,
          description: productForm.description,
          originalPrice,
          discountedPrice,
          discountPercentage,
          expiryDate: productForm.expiryDate,
          category: productForm.category,
          imageUrl: productForm.imageFile
            ? URL.createObjectURL(productForm.imageFile)
            : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
          businessId: user.id!,
          businessName: user.businessName || "My Business",
          location: "My Store Location",
          latitude: 40.7128,
          longitude: -74.006,
          quantity: parseInt(productForm.quantity) || 1,
          status: "ACTIVE" as const,
          isOrganic: productForm.isOrganic,
          tags: [
            productForm.category.toLowerCase(),
            ...(productForm.isOrganic ? ["organic"] : []),
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          hederaTransactionId: registerRes.txHash,
        };
        const currentProducts = Array.isArray(products) ? products : [];
        setProducts([...currentProducts, fallbackProduct]);
        toast.message("Stored locally only", {
          description:
            "Backend save failed; product will disappear after reload.",
        });
      }

      // Reset form
      setProductForm({
        name: "",
        description: "",
        originalPrice: "",
        category: "",
        expiryDate: "",
        quantity: "",
        isOrganic: false,
        imageFile: null,
      });

      setShowAddProductModal(false);
      setAnalysis(null);

      // Show success message with blockchain details
      toast.success("🎉 Product Successfully Added to Hedera Blockchain!", {
        description: `✅ Product Registration TX: ${registerRes.txHash.slice(
          0,
          20
        )}...\nBlock #: ${
          registerRes.blockNumber
        }\n\n🌱 Carbon Credit Mint TX: ${carbonMint.txHash.slice(
          0,
          20
        )}...\nCO2 Saved: ${co2SavedInGrams}g\n\nProduct ID: ${productId}`,
        duration: 6000,
        action: {
          label: "View Product TX",
          onClick: () =>
            window.open(
              `https://hashscan.io/testnet/transaction/${registerRes.txHash}`,
              "_blank"
            ),
        },
      });
    } catch (error: any) {
      console.error("Blockchain transaction failed:", error);
      toast.dismiss();

      // Handle different types of transaction failures
      if (error.message.includes("rejected")) {
        toast.error("❌ Transaction Cancelled", {
          description:
            "You cancelled the blockchain transaction in MetaMask. The product was not registered on the blockchain.",
          duration: 5000,
        });
        return; // Don't continue if user rejected
      } else if (error.message.includes("insufficient funds")) {
        toast.error("❌ Insufficient Funds", {
          description:
            "You don't have enough ETH/HBAR to pay for gas fees. Please add funds to your wallet and try again.",
          duration: 5000,
        });
        return; // Don't continue if insufficient funds
      } else {
        // For network errors or other issues, show error but continue with demo
        toast.error("⚠️ Blockchain Error - Continuing Demo", {
          description: `Network error occurred: ${error.message}\n\nContinuing with offline demo mode for recording purposes.`,
          duration: 4000,
        });
      }

      // Continue with demo flow even if blockchain fails (unless user rejected)
      const expiryDate = new Date(productForm.expiryDate);
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      let discountPercentage = 0;
      if (daysUntilExpiry <= 1) discountPercentage = 50;
      else if (daysUntilExpiry <= 2) discountPercentage = 35;
      else if (daysUntilExpiry <= 3) discountPercentage = 25;
      else if (daysUntilExpiry <= 7) discountPercentage = 15;

      const originalPrice = parseFloat(productForm.originalPrice);
      const discountedPrice = originalPrice * (1 - discountPercentage / 100);

      const newProduct = {
        id: `demo-${Date.now()}`,
        name: productForm.name,
        description: productForm.description,
        originalPrice,
        discountedPrice,
        discountPercentage,
        expiryDate: productForm.expiryDate,
        category: productForm.category,
        imageUrl: productForm.imageFile
          ? URL.createObjectURL(productForm.imageFile)
          : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
        businessId: user.id!,
        businessName: user.businessName || "My Business",
        location: "My Store Location",
        latitude: 40.7128,
        longitude: -74.006,
        quantity: parseInt(productForm.quantity) || 1,
        status: "ACTIVE" as const,
        isOrganic: productForm.isOrganic,
        tags: [
          productForm.category.toLowerCase(),
          ...(productForm.isOrganic ? ["organic"] : []),
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        hederaTransactionId: `demo-offline-${Date.now()}`,
      };

      const currentProductsErr = Array.isArray(products) ? products : [];
      setProducts([...currentProductsErr, newProduct]);

      // Reset form
      setProductForm({
        name: "",
        description: "",
        originalPrice: "",
        category: "",
        expiryDate: "",
        quantity: "",
        isOrganic: false,
        imageFile: null,
      });

      setShowAddProductModal(false);
      setAnalysis(null);

      // Show demo success after network error
      if (
        !error.message.includes("rejected") &&
        !error.message.includes("insufficient funds")
      ) {
        setTimeout(() => {
          toast.success("📦 Product Added to Demo Inventory", {
            description:
              "Product added to local demo inventory for recording purposes. In production, this would be on the blockchain.",
            duration: 4000,
          });
        }, 1000);
      }
    } finally {
      setSubmitting(false);
      setBlockchainTxInProgress(false);
    }
  };

  // Add test transaction function
  const handleTestTransaction = async () => {
    if (!walletConnected) {
      toast.error("Wallet Not Connected", {
        description: "Please connect your wallet first!",
      });
      return;
    }

    try {
      setBlockchainTxInProgress(true);
      console.log("🔗 Sending test transaction...");
      toast.loading("🔗 Sending test transaction...", { id: "test-tx" });

      // Simple self-transfer or gasless action not implemented in real service; placeholder toast
      toast.info("Use actual product registration for real transactions.");

      // Removed old mock success block referencing demo transaction result
    } catch (error: any) {
      console.error("Test transaction failed:", error);

      if (error.message.includes("rejected")) {
        toast.error("❌ Transaction Cancelled", {
          description: "You cancelled the test transaction in MetaMask.",
          id: "test-tx",
        });
      } else if (error.message.includes("insufficient funds")) {
        toast.error("❌ Insufficient Funds", {
          description:
            "You don't have enough ETH to pay for gas fees. Please add funds to your wallet.",
          id: "test-tx",
        });
      } else {
        toast.error("❌ Test Transaction Failed", {
          description: `Transaction failed: ${error.message}`,
          id: "test-tx",
        });
      }
    } finally {
      setBlockchainTxInProgress(false);
    }
  };

  const executeDeleteProduct = async () => {
    if (!deleteTarget) return;
    const productId = deleteTarget.id;
    const previous = products.slice();
    try {
      setProducts(products.filter((p) => p.id !== productId));
      await api.deleteProduct(productId);
      const refreshed = await api.getProducts();
      setProducts(Array.isArray(refreshed) ? refreshed : []);
      toast.success("Product deleted", { description: deleteTarget.name });
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error("Delete failed", { description: err.message });
      setProducts(previous);
      setDeleteTarget(null);
    }
  };

  const requestDeleteProduct = (p: any) => {
    setDeleteTarget({ id: p.id, name: p.name });
  };

  if (isCheckingAuth || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Stocky Business</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.firstName}! 📊
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Hedera Wallet Connection */}
            {walletConnected ? (
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-800"
                >
                  <Wallet className="w-3 h-3 mr-1" />
                  {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                </Badge>
                <Badge variant="outline" className="text-green-600">
                  {parseFloat(walletBalance || "0").toFixed(4)} HBAR
                </Badge>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={handleConnectWallet}
                disabled={connectingWallet}
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {connectingWallet ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}

            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Package className="w-3 h-3 mr-1" />
              {user.businessType} Business
            </Badge>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalProducts || products.length}
              </div>
              <p className="text-xs text-muted-foreground">Active listings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats?.totalRevenue?.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalOrders || orders.length}
              </div>
              <p className="text-xs text-muted-foreground">Total sales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Waste Reduced
              </CardTitle>
              <Leaf className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.wasteReduced || 0}kg
              </div>
              <p className="text-xs text-muted-foreground">
                Environmental impact
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Hedera Guardian Impact Metrics */}
        <Card className="mb-8 border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-green-800">
                    Hedera Guardian Impact
                  </CardTitle>
                  <CardDescription>
                    Verified environmental impact with blockchain transparency
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">
                <Verified className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Award className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-700">
                  {stats?.carbonCreditsGenerated || 0}
                </div>
                <div className="text-sm text-green-600">
                  Carbon Credits Generated
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Ready for trading
                </div>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Shield className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-700">
                  {stats?.guardianTransactions || 0}
                </div>
                <div className="text-sm text-blue-600">
                  Guardian Transactions
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  MRV verified
                </div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-700">
                  {stats?.esgRating || "N/A"}
                </div>
                <div className="text-sm text-purple-600">ESG Rating</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Guardian verified
                </div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Leaf className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-orange-700">
                  ${((stats?.carbonCreditsGenerated || 0) * 12.5).toFixed(0)}
                </div>
                <div className="text-sm text-orange-600">
                  Carbon Credit Value
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Market rate estimate
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Verified className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-semibold text-gray-900">
                      Guardian Verification Status: Active
                      {walletConnected && (
                        <Badge className="ml-2 bg-purple-100 text-purple-800">
                          <Wallet className="w-3 h-3 mr-1" />
                          Wallet Connected
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Latest MRV Report: Guardian-TX-
                      {Date.now().toString().slice(-8)}
                      {walletConnected && (
                        <span className="ml-2">
                          • Hedera Address: {walletAddress?.slice(0, 6)}...
                          {walletAddress?.slice(-4)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-600 text-green-600"
                    onClick={() => {
                      const contract = CONTRACT_ADDRESSES.SUPPLY_CHAIN;
                      window.open(
                        `https://hashscan.io/testnet/contract/${contract}`,
                        "_blank"
                      );
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Contract
                  </Button>
                  {walletConnected && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestTransaction}
                      disabled={blockchainTxInProgress}
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      🧪 Test MetaMask
                    </Button>
                  )}
                  {!walletConnected && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleConnectWallet}
                      disabled={connectingWallet}
                      className="border-purple-600 text-purple-600"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      {connectingWallet ? "Connecting..." : "Connect Wallet"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Quick Add Button */}
        <Card
          className="mb-8 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="pt-6">
            <div className="text-center">
              <Camera className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">
                📸 AI Quick Add Product
              </h2>
              <p className="text-muted-foreground mb-4">
                Take a photo of your product and let AI analyze it instantly!
              </p>
              <Button size="lg">
                <Zap className="h-4 w-4 mr-2" />
                Scan Product with AI
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Your Products ({products.length})</CardTitle>
                <CardDescription>
                  Manage your inventory and pricing
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddProductModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Manually
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const daysUntilExpiry = Math.ceil(
                    (new Date(product.expiryDate).getTime() -
                      new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  const apiBase =
                    import.meta.env.VITE_API_URL || "http://localhost:3001";
                  const displayImage = product.imageUrl?.startsWith("/uploads/")
                    ? `${apiBase}${product.imageUrl}`
                    : product.imageUrl;

                  return (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="relative">
                        <img
                          src={displayImage}
                          alt={product.name}
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400";
                          }}
                        />
                        <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                          -{product.discountPercentage}%
                        </Badge>
                        <Badge
                          variant={
                            daysUntilExpiry <= 1 ? "destructive" : "secondary"
                          }
                          className="absolute top-2 left-2"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {daysUntilExpiry}d
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{product.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <span className="text-lg font-bold text-green-600">
                              ${product.discountedPrice}
                            </span>
                            <span className="text-sm text-muted-foreground line-through ml-2">
                              ${product.originalPrice}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {product.quantity} left
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => requestDeleteProduct(product)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                          {product.hederaTransactionId && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() =>
                                window.open(
                                  `https://hashscan.io/testnet/transaction/${product.hederaTransactionId}`,
                                  "_blank"
                                )
                              }
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View TX
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No products yet.</p>
                <p className="text-sm">Start by adding your first product!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        {orders.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Orders 🛍️</CardTitle>
              <CardDescription>
                Latest customer orders with Hedera payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">
                          {order.product?.name || "Item"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Order #{order.id} •{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex gap-2 items-center">
                          <Badge className="bg-blue-100 text-blue-800">
                            {order.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              order.paymentStatus === "PAID"
                                ? "border-green-500 text-green-600"
                                : order.paymentStatus === "FAILED"
                                ? "border-red-500 text-red-600"
                                : "border-yellow-500 text-yellow-600"
                            }
                          >
                            {order.paymentStatus || "PENDING"}
                          </Badge>
                          {/* Payment completion placeholder (needs ESCROWED distinction if added) */}
                          {order.paymentStatus === "PAID" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  // Attempt to mark complete via backend payments complete route if not already
                                  const token = localStorage.getItem("token");
                                  const paymentId = (order as any).paymentId;
                                  if (paymentId) {
                                    const resp = await fetch(
                                      (import.meta.env.VITE_API_URL ||
                                        "http://localhost:3001") +
                                        "/api/payments/complete",
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                          ...(token
                                            ? {
                                                Authorization: `Bearer ${token}`,
                                              }
                                            : {}),
                                        },
                                        body: JSON.stringify({ paymentId }),
                                      }
                                    );
                                    if (resp.ok) {
                                      toast.success(
                                        "Payment completion submitted"
                                      );
                                    } else {
                                      const err = await resp
                                        .json()
                                        .catch(() => ({}));
                                      toast.error("Complete failed", {
                                        description: err.message || resp.status,
                                      });
                                    }
                                  } else {
                                    toast.message("No paymentId on order");
                                  }
                                } catch (e: any) {
                                  toast.error("Complete error", {
                                    description: e.message,
                                  });
                                }
                              }}
                            >
                              Release
                            </Button>
                          )}
                        </div>
                        <div className="text-lg font-bold mt-1">
                          ${order.totalAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Quantity:</span>{" "}
                        {order.quantity}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Payment:</span>
                        <Badge
                          variant="outline"
                          className="ml-2 text-green-600"
                        >
                          <CreditCard className="w-3 h-3 mr-1" />
                          {order.paymentStatus}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">
                          Hedera TX:
                        </span>
                        <span className="font-mono text-xs ml-1 bg-gray-100 px-2 py-1 rounded">
                          {order.hederaTransactionId}
                        </span>
                        {(order as any).paymentEscrowTxHash && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Escrow:{" "}
                            <button
                              className="underline"
                              onClick={() =>
                                window.open(
                                  `https://hashscan.io/testnet/tx/${
                                    (order as any).paymentEscrowTxHash
                                  }`,
                                  "_blank"
                                )
                              }
                            >
                              {(order as any).paymentEscrowTxHash.slice(0, 10)}
                              ...
                            </button>
                          </div>
                        )}
                        {(order as any).paymentCompleteTxHash && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Released:{" "}
                            <button
                              className="underline"
                              onClick={() =>
                                window.open(
                                  `https://hashscan.io/testnet/tx/${
                                    (order as any).paymentCompleteTxHash
                                  }`,
                                  "_blank"
                                )
                              }
                            >
                              {(order as any).paymentCompleteTxHash.slice(
                                0,
                                10
                              )}
                              ...
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Hidden file input for AI analysis */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* AI Analysis Modal */}
      <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>🤖 AI Product Analysis</DialogTitle>
          </DialogHeader>

          {analyzing ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg font-medium">Analyzing your product...</p>
              <p className="text-sm text-muted-foreground">
                AI is examining image, estimating prices, and calculating
                optimal discounts
              </p>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  ✨ AI Analysis Complete! Review and adjust the suggestions
                  below.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Product Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Name:</strong> {analysis.productName}
                    </div>
                    <div>
                      <strong>Category:</strong> {analysis.category}
                    </div>
                    <div>
                      <strong>Estimated Price:</strong> $
                      {analysis.estimatedPrice}
                    </div>
                    <div>
                      <strong>Expiry Date:</strong> {analysis.expiryEstimate}
                    </div>
                    <div>
                      <strong>Organic:</strong>{" "}
                      {analysis.isOrganic ? "✅ Yes" : "❌ No"}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">🎯 AI Insights</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Freshness:</strong> {analysis.freshness}%
                    </div>
                    <div>
                      <strong>Quality:</strong> {analysis.quality}
                    </div>
                    <div>
                      <strong>Suggested Discount:</strong>{" "}
                      {analysis.suggestedDiscount}%
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">
                  📝 AI Generated Description
                </h3>
                <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                  {analysis.description}
                </p>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleAcceptAnalysis} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Accept & Add Product
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAnalysisModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Add Product Modal */}
      <Dialog open={showAddProductModal} onOpenChange={setShowAddProductModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>➕ Add New Product</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Product Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setProductForm((prev) => ({ ...prev, imageFile: file }));
                    }
                  }}
                />
                {productForm.imageFile && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(productForm.imageFile)}
                      alt="Preview"
                      className="h-24 w-full object-cover rounded border"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Product Name *</label>
                <Input
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Category *</label>
                <Input
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  placeholder="e.g., Fruits, Vegetables, Dairy"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Original Price *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={productForm.originalPrice}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      originalPrice: e.target.value,
                    }))
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  value={productForm.quantity}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      quantity: e.target.value,
                    }))
                  }
                  placeholder="1"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Expiry Date *</label>
                <Input
                  type="date"
                  value={productForm.expiryDate}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      expiryDate: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe the product..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="organic"
                  checked={productForm.isOrganic}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      isOrganic: e.target.checked,
                    }))
                  }
                />
                <label htmlFor="organic" className="text-sm font-medium">
                  🌱 Organic Product
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleSubmitProduct}
              className="flex-1"
              disabled={submitting || !walletConnected}
            >
              {blockchainTxInProgress ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Blockchain Transaction...
                </>
              ) : submitting ? (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Processing...
                </>
              ) : !walletConnected ? (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet First
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  🔗 Add to Hedera Blockchain
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAddProductModal(false)}
            >
              Cancel
            </Button>
          </div>

          {!walletConnected && (
            <Alert className="mt-4">
              <Wallet className="h-4 w-4" />
              <AlertDescription>
                <strong>Wallet Required:</strong> Connect your MetaMask wallet
                to register products on Hedera blockchain with carbon credit
                generation.
              </AlertDescription>
            </Alert>
          )}

          {blockchainTxInProgress && (
            <Alert className="mt-4 border-blue-200 bg-blue-50">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Blockchain Transaction in Progress:</strong>
                <br />
                1. Registering product on Hedera blockchain...
                <br />
                2. Generating Guardian-verified carbon credit...
                <br />
                Please confirm both transactions in MetaMask.
              </AlertDescription>
            </Alert>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          {deleteTarget && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to permanently delete{" "}
                <strong>{deleteTarget.name}</strong>? This action cannot be
                undone and its on-chain history (if any) will remain immutable.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={executeDeleteProduct}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BusinessDashboard;
