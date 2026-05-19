import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { IUser, LoginPayload, SignupPayload } from "@/types";

interface AuthStore {
  user: IUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<IUser>;
  signup: (payload: SignupPayload) => Promise<IUser>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: IUser | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (payload) => {
        set({ isLoading: true });
        try {
          const { data } = await axios.post("/api/auth/login", payload);
          set({ user: data.data.user, isAuthenticated: true });
          return data.data.user;
        } finally {
          set({ isLoading: false });
        }
      },

      signup: async (payload) => {
        set({ isLoading: true });
        try {
          const { data } = await axios.post("/api/auth/signup", payload);
          set({ user: data.data.user, isAuthenticated: true });
          return data.data.user;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        await axios.post("/api/auth/logout");
        set({ user: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        set({ isLoading: true });
        try {
          const { data } = await axios.get("/api/auth/me");
          set({ user: data.data, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),
    {
      name: "medixai-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
