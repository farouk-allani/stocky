import { create } from "zustand";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "BUSINESS" | "CONSUMER" | "ADMIN";
  businessName?: string;
  businessType?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "BUSINESS" | "CONSUMER";
  businessName?: string;
  businessType?: string;
}

const API_BASE_URL = "https://stocky-hedera-api.vercel.app/api";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem("token"),
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      console.log("Login response:", data); // Debug log

      localStorage.setItem("token", data.token);
      set({ user: data.user, token: data.token, isLoading: false });
      console.log("User set in store:", data.user); // Debug log
    } catch (error) {
      console.error("Login error:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (registerData: RegisterData) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const data = await response.json();

      localStorage.setItem("token", data.token);
      set({ user: data.user, token: data.token, isLoading: false });
    } catch (error) {
      console.error("Registration error:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },

  setUser: (user: User | null) => {
    set({ user });
  },
}));
