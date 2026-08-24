import { create } from "zustand";

import { getStorage, removeStorage, setStorage } from "@/lib/storage";

import type { User } from "@/types/auth";

const USER_KEY = "qrz_user";
const TOKEN_KEY = "qrz_access_token";

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: async (user, token) => {
    await setStorage(USER_KEY, JSON.stringify(user));

    await setStorage(TOKEN_KEY, token);

    set({
      user,
      token,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    await removeStorage(USER_KEY);
    await removeStorage(TOKEN_KEY);

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  hydrate: async () => {
    try {
      const storedUser = await getStorage(USER_KEY);
      const storedToken = await getStorage(TOKEN_KEY);

      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser) as User;

        set({
          user,
          token: storedToken,
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
        token: null,
        isAuthenticated: false,
        isHydrated: true,
      });
    }
  },
}));
