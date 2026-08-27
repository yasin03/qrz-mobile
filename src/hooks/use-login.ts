import { useMutation } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";

type LoginRequest = {
  username: string;
  password: string;
};

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (values: LoginRequest) => {
      const response = await api.post("/api/auth", values);
      return response.data;
    },

    onSuccess: async (data) => {
      console.log("LOGIN RESPONSE:", data);
      if (data?.Sonuc !== "1") {
        return;
      }

      const { Sonuc, ...user } = data;

      await setAuth(user);
    },

    onError: (error) => {
      console.error("LOGIN ERROR:", error);
    },
  });
}
