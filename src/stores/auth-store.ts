import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

import type { User } from "@/types/auth";

const USER_KEY = "qrz_user";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  setAuth: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: async (user) => {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

    set({
      user,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(USER_KEY);

    set({
      user: null,
      isAuthenticated: false,
    });
  },

  hydrate: async () => {
    try {
      const storedUser = await SecureStore.getItemAsync(USER_KEY);

      if (storedUser) {
        const user = JSON.parse(storedUser) as User;

        set({
          user,
          isAuthenticated: true,
          isHydrated: true,
        });

        return;
      }

      set({
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
}));
