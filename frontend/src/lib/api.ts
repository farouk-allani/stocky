// API Configuration and Service
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// API Client
class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem("authToken");

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Network error" }));
      throw new Error(
        error.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.request<{ token: string; user: any }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  // Product endpoints
  async getProducts(params?: {
    location?: string;
    category?: string;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.location) queryParams.append("location", params.location);
    if (params?.category) queryParams.append("category", params.category);
    if (params?.search) queryParams.append("search", params.search);

    const query = queryParams.toString();
    return this.request<any[]>(`/api/products${query ? `?${query}` : ""}`);
  }

  async getProductById(id: string) {
    return this.request<any>(`/api/products/${id}`);
  }

  async createProduct(productData: any) {
    return this.request<any>("/api/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: any) {
    return this.request<any>(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string) {
    return this.request<void>(`/api/products/${id}`, {
      method: "DELETE",
    });
  }

  // AI Analysis endpoint
  async analyzeProduct(imageFile: File) {
    const formData = new FormData();
    formData.append("image", imageFile);

    const token = localStorage.getItem("authToken");
    const response = await fetch(`${this.baseURL}/api/ai/analyze`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to analyze product");
    }

    return response.json();
  }

  // Order endpoints
  async createOrder(orderData: any) {
    // Mock order creation for demo - simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Return mock order object
    return {
      id: `order_${Date.now()}`,
      productId: orderData.productId,
      quantity: orderData.quantity,
      totalAmount: orderData.totalAmount,
      status: "CONFIRMED",
      pickupTime: orderData.pickupTime,
      paymentMethod: orderData.paymentMethod,
      notes: orderData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: {
        id: "user_123",
        name: "Demo User",
        email: "demo@example.com",
      },
      business: {
        id: "business_456",
        name: "Demo Business",
        location: "Demo Location",
      },
    };
  }

  async getOrders() {
    return this.request<any[]>("/api/orders");
  }

  async getOrderById(id: string) {
    return this.request<any>(`/api/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request<any>(`/api/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  // Business endpoints
  async getBusinessStats() {
    return this.request<any>("/api/businesses/stats");
  }

  async updateBusinessProfile(profileData: any) {
    return this.request<any>("/api/businesses/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  // Hedera blockchain endpoints
  async createHederaTransaction(transactionData: any) {
    return this.request<any>("/api/hedera/transaction", {
      method: "POST",
      body: JSON.stringify(transactionData),
    });
  }

  async getHederaTransactionStatus(transactionId: string) {
    return this.request<any>(`/api/hedera/transaction/${transactionId}`);
  }

  // Consumer endpoints
  async getConsumerStats() {
    return this.request<any>("/api/users/consumer-stats");
  }

  async addToFavorites(productId: string) {
    return this.request<void>("/api/users/favorites", {
      method: "POST",
      body: JSON.stringify({ productId }),
    });
  }

  async removeFromFavorites(productId: string) {
    return this.request<void>(`/api/users/favorites/${productId}`, {
      method: "DELETE",
    });
  }

  async getFavorites() {
    return this.request<any[]>("/api/users/favorites");
  }
}

export const api = new APIClient(API_BASE_URL);
