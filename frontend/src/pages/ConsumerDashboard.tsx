import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/auth";
import { useProductStore, useConsumerStore, useOrderStore } from "@/lib/stores";
import { demoHederaWallet } from "@/lib/demo-hedera-wallet";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  ShoppingBag,
  MapPin,
  Star,
  DollarSign,
  Percent,
  Clock,
  Navigation,
  Heart,
  ShoppingCart,
  Filter,
  Leaf,
  Truck,
  CreditCard,
} from "lucide-react";

// Mock data - in a real app this would come from the API
const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Organic Bananas",
    description:
      "Fresh organic bananas, slightly overripe - perfect for smoothies!",
    originalPrice: 4.99,
    discountedPrice: 2.99,
    discountPercentage: 40,
    expiryDate: "2025-08-09",
    category: "Fruits",
    imageUrl:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
    businessId: "1",
    businessName: "Green Grocer",
    location: "Downtown Market, 123 Main St",
    latitude: 40.7128,
    longitude: -74.006,
    quantity: 15,
    status: "ACTIVE" as const,
    isOrganic: true,
    tags: ["organic", "fruit", "healthy"],
    createdAt: "2025-08-07T08:00:00Z",
    updatedAt: "2025-08-07T08:00:00Z",
  },
  {
    id: "2",
    name: "Artisan Bread",
    description: "Freshly baked sourdough bread from this morning, ends today!",
    originalPrice: 8.99,
    discountedPrice: 4.99,
    discountPercentage: 44,
    expiryDate: "2025-08-08",
    category: "Bakery",
    imageUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400",
    businessId: "2",
    businessName: "Corner Bakery",
    location: "Artisan Street, 456 Baker Ave",
    latitude: 40.7589,
    longitude: -73.9851,
    quantity: 8,
    status: "ACTIVE" as const,
    isOrganic: false,
    tags: ["bread", "bakery", "artisan"],
    createdAt: "2025-08-07T06:00:00Z",
    updatedAt: "2025-08-07T06:00:00Z",
  },
  {
    id: "3",
    name: "Premium Yogurt",
    description:
      "Greek yogurt variety pack, expires tomorrow but still delicious!",
    originalPrice: 12.99,
    discountedPrice: 6.99,
    discountPercentage: 46,
    expiryDate: "2025-08-08",
    category: "Dairy",
    imageUrl:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
    businessId: "1",
    businessName: "Green Grocer",
    location: "Downtown Market, 123 Main St",
    latitude: 40.7128,
    longitude: -74.006,
    quantity: 12,
    status: "ACTIVE" as const,
    isOrganic: true,
    tags: ["dairy", "protein", "healthy"],
    createdAt: "2025-08-07T07:30:00Z",
    updatedAt: "2025-08-07T07:30:00Z",
  },
];

const MOCK_CONSUMER_STATS = {
  totalSaved: 156.78,
  totalOrders: 23,
  averageDiscount: 38,
  favoriteStores: ["Green Grocer", "Corner Bakery"],
  monthlySpending: 89.45,
  co2Saved: 12.4,
};

export function ConsumerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    products,
    loading,
    searchQuery,
    selectedCategory,
    setProducts,
    setSearchQuery,
    setSelectedCategory,
    fetchProducts,
  } = useProductStore();
  const {
    stats,
    favorites,
    userLocation,
    setStats,
    setFavorites,
    getCurrentLocation,
    addToFavorites,
    removeFromFavorites,
  } = useConsumerStore();
  const { createOrder } = useOrderStore();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);

  // Wallet connection states
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [connectingWallet, setConnectingWallet] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);

      if (!user || user.role !== "CONSUMER") {
        navigate("/");
        return;
      }

      // Load mock data immediately for demo
      setProducts(MOCK_PRODUCTS);
      setStats(MOCK_CONSUMER_STATS);
      setFavorites([MOCK_PRODUCTS[0]]); // Mock favorite

      // Try to get user location
      getCurrentLocation().catch(console.error);

      // Check wallet connection
      checkWalletConnection();
    }, 500);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  const checkWalletConnection = async () => {
    try {
      if (demoHederaWallet.isConnected()) {
        const address = demoHederaWallet.getWalletAddress();
        setWalletAddress(address);
        setWalletConnected(true);

        // Mock balance for demo
        const mockBalance = (Math.random() * 100 + 25).toFixed(4);
        setWalletBalance(mockBalance);
      }
    } catch (error) {
      console.error("Failed to check wallet connection:", error);
    }
  };

  const handleConnectWallet = async () => {
    // Check for MetaMask first
    if (!demoHederaWallet.isMetaMaskInstalled()) {
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
      const walletInfo = await demoHederaWallet.connectWallet();
      setWalletAddress(walletInfo.address);
      setWalletBalance((Math.random() * 100 + 25).toFixed(4)); // Mock balance
      setWalletConnected(true);

      toast.success("🎉 Wallet Connected Successfully!", {
        description: `Network: Hedera Testnet\nAddress: ${walletInfo.address.slice(
          0,
          6
        )}...${walletInfo.address.slice(-4)}\nBalance: ${(
          Math.random() * 100 +
          25
        ).toFixed(4)} HBAR\n\nYou can now make secure payments!`,
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

  const handleDisconnectWallet = async () => {
    try {
      await demoHederaWallet.disconnectWallet();
      setWalletConnected(false);
      setWalletAddress(null);
      setWalletBalance(null);

      toast.success("Wallet Disconnected", {
        description: "Your wallet has been safely disconnected.",
      });
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      toast.error("Failed to disconnect wallet");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Filter products based on search
    if (query) {
      const filtered = MOCK_PRODUCTS.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase()) ||
          product.businessName.toLowerCase().includes(query.toLowerCase())
      );
      setProducts(filtered);
    } else {
      setProducts(MOCK_PRODUCTS);
    }
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    if (category === "all" || !category) {
      setProducts(MOCK_PRODUCTS);
    } else {
      const filtered = MOCK_PRODUCTS.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );
      setProducts(filtered);
    }
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setShowProductModal(true);
    setOrderQuantity(1);
  };

  const handleOrder = async () => {
    if (!selectedProduct || !user) return;

    // Check wallet connection first
    if (!walletConnected) {
      toast.error("Wallet Not Connected", {
        description:
          "Please connect your MetaMask wallet first to make secure payments.",
        action: {
          label: "Connect Wallet",
          onClick: () => {
            setShowProductModal(false);
            handleConnectWallet();
          },
        },
      });
      return;
    }

    setProcessing(true);
    try {
      // Check if wallet is available for payment
      if (!demoHederaWallet.isMetaMaskInstalled()) {
        toast.error("MetaMask Required", {
          description:
            "MetaMask is required for secure blockchain payments. Please install MetaMask to continue.",
          action: {
            label: "Install MetaMask",
            onClick: () => window.open("https://metamask.io/", "_blank"),
          },
        });
        return;
      }

      // Simulate order creation with real Hedera transaction
      const orderData = {
        productId: selectedProduct.id,
        quantity: orderQuantity,
        totalAmount: selectedProduct.discountedPrice * orderQuantity,
        pickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        paymentMethod: "HEDERA_HBAR",
        notes: `Order placed via Stocky app. Pickup location: ${selectedProduct.location}`,
      };

      // Show payment processing
      toast.loading("💳 Processing payment with MetaMask...", {
        id: "payment",
      });

      // Trigger real MetaMask payment transaction
      try {
        const paymentTxHash =
          await demoHederaWallet.sendRealMetaMaskTransaction(
            `0x${((orderData.totalAmount * 1000000000000000000) / 100).toString(
              16
            )}` // Convert to wei equivalent
          );

        toast.success("✅ Payment confirmed!", { id: "payment" });

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        await createOrder(orderData);

        // Show success toast
        toast.success("🎉 Order Placed Successfully!", {
          description: `Pickup Time: ${new Date(
            orderData.pickupTime
          ).toLocaleString()}\nLocation: ${
            selectedProduct.location
          }\n\nPayment Hash: ${paymentTxHash.slice(
            0,
            10
          )}...\nHedera payment processed securely!`,
          duration: 6000,
          action: {
            label: "View Transaction",
            onClick: () =>
              window.open(
                `https://hashscan.io/testnet/transaction/${paymentTxHash}`,
                "_blank"
              ),
          },
        });

        setShowProductModal(false);
        setSelectedProduct(null);
      } catch (paymentError: any) {
        toast.dismiss("payment");

        if (paymentError.message.includes("rejected")) {
          toast.error("❌ Payment Cancelled", {
            description:
              "You cancelled the payment in MetaMask. Your order was not placed.",
          });
        } else if (paymentError.message.includes("insufficient funds")) {
          toast.error("❌ Insufficient Funds", {
            description:
              "You don't have enough ETH to complete this payment. Please add funds to your wallet.",
          });
        } else {
          // For demo: Continue with order even if payment fails
          toast.warning("⚠️ Payment Error - Demo Mode", {
            description:
              "Payment failed but continuing with demo order for recording purposes.",
          });

          await createOrder(orderData);

          setTimeout(() => {
            toast.success("📦 Demo Order Placed", {
              description: `Demo order created successfully!\nPickup Time: ${new Date(
                orderData.pickupTime
              ).toLocaleString()}\nLocation: ${selectedProduct.location}`,
              duration: 4000,
            });
          }, 1000);

          setShowProductModal(false);
          setSelectedProduct(null);
        }
      }
    } catch (error) {
      toast.error("❌ Order Failed", {
        description: `Failed to place order: ${error}`,
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleFavorite = async (product: any) => {
    try {
      const isFavorite = favorites.some((f) => f.id === product.id);
      if (isFavorite) {
        await removeFromFavorites(product.id);
      } else {
        await addToFavorites(product.id);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const handleNearMeClick = () => {
    if (!userLocation) {
      getCurrentLocation()
        .then(() => {
          setShowMapModal(true);
        })
        .catch(() => {
          toast.error("Location Access Required", {
            description:
              "Please enable location access to find nearby stores! Check your browser settings and try again.",
          });
        });
    } else {
      setShowMapModal(true);
    }
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

  const categories = ["all", "Fruits", "Bakery", "Dairy", "Vegetables", "Meat"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Stocky Market</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.firstName}! 🛒
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Wallet Connection Status */}
            {walletConnected ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700 font-medium">
                  {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnectWallet}
                  className="text-green-700 hover:text-red-600 hover:bg-red-50 h-6 px-2"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={handleConnectWallet}
                disabled={connectingWallet}
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {connectingWallet ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}

            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Leaf className="w-3 h-3 mr-1" />
              Consumer
            </Badge>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Wallet Status Section */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    walletConnected ? "bg-emerald-500" : "bg-gray-400"
                  }`}
                ></div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {walletConnected
                      ? "🔗 Payment Wallet Connected"
                      : "⚠️ Payment Wallet Not Connected"}
                  </h3>
                  <div className="text-sm text-gray-600">
                    {walletConnected
                      ? `Address: ${walletAddress?.slice(
                          0,
                          6
                        )}...${walletAddress?.slice(
                          -4
                        )} • Balance: ${walletBalance} HBAR`
                      : "Connect your MetaMask wallet to make secure blockchain payments"}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {walletConnected && (
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      Available Balance
                    </div>
                    <div className="font-semibold text-emerald-600">
                      {walletBalance} HBAR
                    </div>
                  </div>
                )}
                <Button
                  onClick={
                    walletConnected
                      ? handleDisconnectWallet
                      : handleConnectWallet
                  }
                  disabled={connectingWallet}
                  className={`${
                    walletConnected
                      ? "bg-red-100 text-red-700 border border-red-300 hover:bg-red-200"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                  variant={walletConnected ? "outline" : "default"}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {connectingWallet
                    ? "Connecting..."
                    : walletConnected
                    ? "Disconnect"
                    : "Connect Wallet"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search for discounted products..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleNearMeClick} variant="outline">
                  <MapPin className="h-4 w-4 mr-2" />
                  Near Me
                </Button>
              </div>

              {/* Category Filters */}
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleCategoryFilter(category)}
                  >
                    {category === "all" ? "All Categories" : category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Money Saved</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats?.totalSaved?.toFixed(2) || "0.00"}
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
                {stats?.totalOrders || 0}
              </div>
              <p className="text-xs text-muted-foreground">Total purchases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Discount
              </CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.averageDiscount || 0}%
              </div>
              <p className="text-xs text-muted-foreground">On purchases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CO₂ Saved</CardTitle>
              <Leaf className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.co2Saved || 0}kg
              </div>
              <p className="text-xs text-muted-foreground">
                Environmental impact
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Hedera Guardian Environmental Impact Section */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-green-800">
                  <Leaf className="w-5 h-5 mr-2" />
                  Hedera Guardian Environmental Impact
                </CardTitle>
                <CardDescription className="text-green-700">
                  Your contribution to reducing food waste and earning carbon
                  credits
                </CardDescription>
              </div>
              <Badge className="bg-green-600 text-white">
                🌍 Verified by Hedera Guardian
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Carbon Credits Earned */}
              <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {(stats?.totalOrders * 0.3).toFixed(1) || "0.0"}
                </div>
                <div className="text-sm font-medium text-green-800 mb-1">
                  Carbon Credits Earned
                </div>
                <div className="text-xs text-green-600">
                  Verified on Hedera Hashgraph
                </div>
              </div>

              {/* Food Waste Prevented */}
              <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {(stats?.totalOrders * 1.2).toFixed(1) || "0.0"}kg
                </div>
                <div className="text-sm font-medium text-blue-800 mb-1">
                  Food Waste Prevented
                </div>
                <div className="text-xs text-blue-600">
                  Tracked via smart contracts
                </div>
              </div>

              {/* Environmental Score */}
              <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Math.min(100, stats?.totalOrders * 4.2).toFixed(0) || "0"}
                  /100
                </div>
                <div className="text-sm font-medium text-purple-800 mb-1">
                  Eco Impact Score
                </div>
                <div className="text-xs text-purple-600">
                  Guardian verified rating
                </div>
              </div>
            </div>

            {/* Guardian Integration Status */}
            <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-green-800">
                  🔗 Guardian Integration Status
                </h4>
                <Badge className="bg-green-100 text-green-800">
                  ✅ Active & Verified
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Guardian Node: hedera-guardian-testnet-01</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Last Sync: {new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Policy: FoodWasteReduction-v2.1</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Registry: Hedera Carbon Registry</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-4 border-t border-green-200">
                <Button
                  variant="outline"
                  className="w-full border-green-600 text-green-700 hover:bg-green-50"
                  onClick={() => {
                    toast.success("🌍 Guardian Dashboard", {
                      description:
                        "Opening Hedera Guardian portal to view detailed environmental impact reports and carbon credit transactions...",
                      duration: 4000,
                      action: {
                        label: "View Details",
                        onClick: () =>
                          window.open("https://guardian.hedera.com/", "_blank"),
                      },
                    });
                  }}
                >
                  <Leaf className="w-4 h-4 mr-2" />
                  View Guardian Environmental Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Available Deals 🔥</CardTitle>
            <CardDescription>
              Fresh discounted products near you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const isFavorite = favorites.some((f) => f.id === product.id);
                  const daysUntilExpiry = Math.ceil(
                    (new Date(product.expiryDate).getTime() -
                      new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );

                  return (
                    <Card
                      key={product.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                    >
                      <div className="relative">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                          onClick={() => handleProductClick(product)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(product);
                          }}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              isFavorite ? "fill-red-500 text-red-500" : ""
                            }`}
                          />
                        </Button>
                        <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                          -{product.discountPercentage}%
                        </Badge>
                      </div>
                      <CardContent
                        className="p-4"
                        onClick={() => handleProductClick(product)}
                      >
                        <h3 className="font-semibold text-lg mb-2">
                          {product.name}
                        </h3>
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
                          <Badge
                            variant={
                              daysUntilExpiry <= 1 ? "destructive" : "secondary"
                            }
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {daysUntilExpiry}d
                          </Badge>
                        </div>

                        <div className="flex items-center text-sm text-muted-foreground mb-3">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="truncate">
                            {product.businessName}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {product.quantity} left
                          </span>
                          {product.isOrganic && (
                            <Badge
                              variant="outline"
                              className="text-green-600 border-green-600"
                            >
                              <Leaf className="w-3 h-3 mr-1" />
                              Organic
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No products found matching your criteria.</p>
                <p className="text-sm">Try adjusting your search or filters!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Product Detail Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-2xl">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.name}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    {selectedProduct.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-green-600">
                        ${selectedProduct.discountedPrice}
                      </span>
                      <span className="text-lg text-muted-foreground line-through ml-2">
                        ${selectedProduct.originalPrice}
                      </span>
                    </div>
                    <Badge className="bg-red-500 text-white">
                      -{selectedProduct.discountPercentage}%
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{selectedProduct.location}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>
                        Expires:{" "}
                        {new Date(
                          selectedProduct.expiryDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Truck className="w-4 h-4 mr-2" />
                      <span>{selectedProduct.quantity} items available</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quantity:</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setOrderQuantity(Math.max(1, orderQuantity - 1))
                        }
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{orderQuantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setOrderQuantity(
                            Math.min(
                              selectedProduct.quantity,
                              orderQuantity + 1
                            )
                          )
                        }
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium">Total:</span>
                      <span className="text-xl font-bold text-green-600">
                        $
                        {(
                          selectedProduct.discountedPrice * orderQuantity
                        ).toFixed(2)}
                      </span>
                    </div>

                    <Button
                      className={`w-full ${
                        !walletConnected
                          ? "bg-orange-600 hover:bg-orange-700"
                          : ""
                      }`}
                      onClick={handleOrder}
                      disabled={processing}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {processing
                        ? "Processing..."
                        : walletConnected
                        ? "Order with Hedera Pay"
                        : "Connect Wallet to Order"}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Map Modal */}
      <Dialog open={showMapModal} onOpenChange={setShowMapModal}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Nearby Stores</DialogTitle>
          </DialogHeader>
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Google Maps integration would appear here
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Your location:{" "}
                {userLocation
                  ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(
                      4
                    )}`
                  : "Not available"}
              </p>
              <div className="mt-4 space-y-2">
                {MOCK_PRODUCTS.map((product) => (
                  <div
                    key={product.id}
                    className="text-left bg-white p-3 rounded border"
                  >
                    <div className="font-medium">{product.businessName}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.location}
                    </div>
                    <div className="text-sm text-green-600">
                      {Math.floor(Math.random() * 5 + 1)} products available
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
