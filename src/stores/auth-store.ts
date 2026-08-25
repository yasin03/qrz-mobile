import { create } from "zustand";

import {
  getStorageItem,
  removeStorageItem,
  setStorageItem,
} from "@/lib/storage";
import type { User } from "@/types/auth";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  setAuth: (user: User) => Promise<void>;

  hydrate: () => Promise<void>;

  logout: () => Promise<void>;
};

const USER_KEY = "qrz_user";

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const decoded = atob(padded);
    const payload = JSON.parse(decoded) as { exp?: number };

    if (!payload.exp) return true;

    // 10 saniyelik tolerans ile kontrol
    return Date.now() >= (payload.exp - 10) * 1000;
  } catch {
    return true;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: async (user) => {
    await setStorageItem(USER_KEY, JSON.stringify(user));

    set({
      user,
      isAuthenticated: true,
    });
  },

  hydrate: async () => {
    try {
      const userJson = await getStorageItem(USER_KEY);

      const user = userJson ? (JSON.parse(userJson) as User) : null;

      // Token süresi dolmuşsa otomatik logout
      if (user?.token && isTokenExpired(user.token)) {
        await removeStorageItem(USER_KEY);
        set({ user: null, isAuthenticated: false, isHydrated: true });
        return;
      }

      set({
        user,
        isAuthenticated: !!user,
        isHydrated: true,
      });
    } catch (error) {
      console.error("Auth hydrate error:", error);

      set({
        user: null,
        isAuthenticated: false,
        isHydrated: true,
      });
    }
  },

  logout: async () => {
    await removeStorageItem(USER_KEY);

    set({
      user: null,
      isAuthenticated: false,
    });
  },
}));
