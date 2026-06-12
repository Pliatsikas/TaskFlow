import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@taskflow/shared";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      setAuth: (user, accessToken) => set({ user, accessToken }),

      setAccessToken: (accessToken) => set({ accessToken }),

      logout: () => set({ user: null, accessToken: null }),

      // Derived getter — not stored, computed on read
      isAuthenticated: () => !!get().accessToken && !!get().user,
    }),
    {
      name: "taskflow-auth",
      // Only persist user info, not the access token
      // (access token is refreshed on page load via the refresh cookie)
      partialize: (state) => ({ user: state.user }),
    }
  )
);
