import { useMutation } from "@tanstack/react-query";

import { api, ApiClientError } from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/types/auth";

type LoginRequest = {
  username: string;
  password: string;
};

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (values: LoginRequest): Promise<User> => {
      const response = await api.post<User>("/api/auth", values);
      const user = response.data as User | null;

      if (!user || !user.token || !user.IDKullanici) {
        throw new ApiClientError(
          "Gecersiz login yaniti alindi.",
          response.status,
          "INVALID_LOGIN_RESPONSE",
          response.data,
        );
      }

      return user;
    },

    onSuccess: async (user) => {
      await setAuth(user);
    },

    onError: (error) => {
      console.error("LOGIN ERROR:", error);
    },
  });
}
