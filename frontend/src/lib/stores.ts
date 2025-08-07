import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "./api";

// Product Store
interface Product {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  expiryDate: string;
  category: string;
  imageUrl: string;
  businessId: string;
  businessName: string;
  location: string;
  latitude: number;
  longitude: number;
  quantity: number;
  status: "ACTIVE" | "SOLD_OUT" | "EXPIRED";
  isOrganic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  hederaTransactionId?: string; // Optional blockchain transaction ID
}

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string;
  selectedLocation: string;

  // Actions
  setProducts: (products: Product[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedLocation: (location: string) => void;

  // API Actions
  fetchProducts: () => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  createProduct: (
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  analyzeProductImage: (imageFile: File) => Promise<any>;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  searchQuery: "",
  selectedCategory: "",
  selectedLocation: "",

  setProducts: (products) => set({ products }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSelectedLocation: (selectedLocation) => set({ selectedLocation }),

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const { searchQuery, selectedCategory, selectedLocation } = get();
      const products = await api.getProducts({
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        location: selectedLocation || undefined,
      });
      set({ products, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchProductById: async (id: string) => {
    try {
      return await api.getProductById(id);
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    }
  },

  createProduct: async (productData) => {
    set({ loading: true, error: null });
    try {
      const newProduct = await api.createProduct(productData);
      const { products } = get();
      set({
        products: [...products, newProduct],
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateProduct: async (id: string, productData) => {
    set({ loading: true, error: null });
    try {
      const updatedProduct = await api.updateProduct(id, productData);
      const { products } = get();
      set({
        products: products.map((p) => (p.id === id ? updatedProduct : p)),
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await api.deleteProduct(id);
      const { products } = get();
      set({
        products: products.filter((p) => p.id !== id),
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  analyzeProductImage: async (imageFile: File) => {
    try {
      return await api.analyzeProduct(imageFile);
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },
}));

// Order Store
interface Order {
  id: string;
  productId: string;
  product: Product;
  consumerId: string;
  businessId: string;
  quantity: number;
  totalAmount: number;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "COMPLETED"
    | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  hederaTransactionId?: string;
  pickupTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderStore {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;

  // Actions
  setOrders: (orders: Order[]) => void;
  setCurrentOrder: (order: Order | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API Actions
  fetchOrders: () => Promise<void>;
  createOrder: (orderData: any) => Promise<Order>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  fetchOrderById: (id: string) => Promise<Order | null>;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,

  setOrders: (orders) => set({ orders }),
  setCurrentOrder: (currentOrder) => set({ currentOrder }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const orders = await api.getOrders();
      set({ orders, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      const newOrder = await api.createOrder(orderData);
      const { orders } = get();
      set({
        orders: [...orders, newOrder],
        currentOrder: newOrder,
        loading: false,
      });
      return newOrder;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateOrderStatus: async (id: string, status: string) => {
    try {
      const updatedOrder = await api.updateOrderStatus(id, status);
      const { orders } = get();
      set({
        orders: orders.map((o) => (o.id === id ? updatedOrder : o)),
      });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  fetchOrderById: async (id: string) => {
    try {
      const order = await api.getOrderById(id);
      set({ currentOrder: order });
      return order;
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    }
  },
}));

// Consumer Store
interface ConsumerStats {
  totalSaved: number;
  totalOrders: number;
  averageDiscount: number;
  favoriteStores: string[];
  monthlySpending: number;
  co2Saved: number; // Environmental impact
}

interface ConsumerStore {
  stats: ConsumerStats | null;
  favorites: Product[];
  nearbyStores: any[];
  loading: boolean;
  error: string | null;
  userLocation: { lat: number; lng: number } | null;

  // Actions
  setStats: (stats: ConsumerStats) => void;
  setFavorites: (favorites: Product[]) => void;
  setNearbyStores: (stores: any[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;

  // API Actions
  fetchConsumerStats: () => Promise<void>;
  fetchFavorites: () => Promise<void>;
  addToFavorites: (productId: string) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  getCurrentLocation: () => Promise<void>;
}

export const useConsumerStore = create<ConsumerStore>()(
  persist(
    (set, get) => ({
      stats: null,
      favorites: [],
      nearbyStores: [],
      loading: false,
      error: null,
      userLocation: null,

      setStats: (stats) => set({ stats }),
      setFavorites: (favorites) => set({ favorites }),
      setNearbyStores: (nearbyStores) => set({ nearbyStores }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setUserLocation: (userLocation) => set({ userLocation }),

      fetchConsumerStats: async () => {
        set({ loading: true, error: null });
        try {
          const stats = await api.getConsumerStats();
          set({ stats, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      fetchFavorites: async () => {
        try {
          const favorites = await api.getFavorites();
          set({ favorites });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      addToFavorites: async (productId: string) => {
        try {
          await api.addToFavorites(productId);
          const { favorites } = get();
          // Refresh favorites list
          await get().fetchFavorites();
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },

      removeFromFavorites: async (productId: string) => {
        try {
          await api.removeFromFavorites(productId);
          const { favorites } = get();
          set({ favorites: favorites.filter((p) => p.id !== productId) });
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },

      getCurrentLocation: async () => {
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            set({ error: "Geolocation is not supported by this browser." });
            reject(new Error("Geolocation not supported"));
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              set({ userLocation: location });
              resolve();
            },
            (error) => {
              set({ error: `Location error: ${error.message}` });
              reject(error);
            },
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            }
          );
        });
      },
    }),
    {
      name: "consumer-store",
      partialize: (state) => ({
        userLocation: state.userLocation,
        favorites: state.favorites,
      }),
    }
  )
);

// Business Store
interface BusinessStats {
  totalProducts: number;
  totalRevenue: number;
  totalOrders: number;
  averageDiscount: number;
  wasteReduced: number; // kg
  co2Saved: number;
  monthlyGrowth: number;
  carbonCreditsGenerated?: number; // Guardian carbon credits
  guardianTransactions?: number; // Number of Guardian MRV transactions
  esgRating?: string; // ESG compliance rating
  verifiedImpact?: boolean; // Guardian verification status
}

interface BusinessStore {
  stats: BusinessStats | null;
  loading: boolean;
  error: string | null;

  // Actions
  setStats: (stats: BusinessStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API Actions
  fetchBusinessStats: () => Promise<void>;
  updateBusinessProfile: (profileData: any) => Promise<void>;
}

export const useBusinessStore = create<BusinessStore>((set, get) => ({
  stats: null,
  loading: false,
  error: null,

  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchBusinessStats: async () => {
    set({ loading: true, error: null });
    try {
      const stats = await api.getBusinessStats();
      set({ stats, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateBusinessProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      await api.updateBusinessProfile(profileData);
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
}));

// Export types
export type { Product, Order, ConsumerStats, BusinessStats };
