import { useMutation } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import { login } from "@/services/auth/auth-service";
import { useAuthStore } from "@/stores/auth-store";

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: login,

    onSuccess: async (data) => {
      if (data.Sonuc === "1" && data.token) {
        await setAuth(data, data.token);

        // console.log("AUTH TOKEN:", useAuthStore.getState().token);
        try {
          const response = await api.get("/api/test-auth");
          // console.log("TEST AUTH:", response.data);
        } catch (error) {
          console.error("TEST AUTH ERROR:", error);
        }
      }
    },
  });
}
