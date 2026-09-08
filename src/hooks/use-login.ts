import { useMutation } from "@tanstack/react-query";
import { getDeviceId } from "@/lib/device";
import { api, ApiClientError } from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/types/auth";
import { Alert } from "react-native";

type LoginRequest = {
  username: string;
  password: string;
};

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (values: LoginRequest): Promise<User> => {
      const idDevice = await getDeviceId();
      const response = await api.post<User>("/api/auth", {
        ...values,
        idDevice,
      });

      console.log("LOGIN RESPONSE:", response);
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
      if (user.message != "IDDevice dogru ve eslesiyor") {
        Alert.alert("Bilgi", user.message);
      }
    },

    onError: (error) => {
      console.error("LOGIN ERROR:", error);
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Giriş yapılamadı. Lütfen tekrar deneyin.";

      Alert.alert("Hata", message);
    },
  });
}
