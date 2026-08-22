import { useMutation } from "@tanstack/react-query";

import { login } from "@/services/auth/auth-service";
import { useAuthStore } from "@/stores/auth-store";

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: login,

    onSuccess: async (data) => {
      if (data.Sonuc !== "1") {
        return;
      }

      await setAuth(data);
    },
  });
}
