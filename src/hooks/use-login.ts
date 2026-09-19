import { useMutation } from "@tanstack/react-query";
import { getDeviceId } from "@/lib/device";
import { api, ApiClientError } from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/types/auth";
import { Alert } from "react-native";
import axios from "axios";

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
      /*  console.error("LOGIN ERROR:", error);
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Giriş yapılamadı. Lütfen tekrar deneyin.";

      Alert.alert("Hata", message); */

      console.error("LOGIN ERROR:", error);
      if (axios.isAxiosError(error)) {
        console.log("===== LOGIN ERROR =====");
        console.log("message:", error.message);
        console.log("code:", error.code);
        console.log("url:", error.config?.url);
        console.log("baseURL:", error.config?.baseURL);
        console.log("method:", error.config?.method);
        console.log("status:", error.response?.status);
        console.log("response:", error.response?.data);
        console.log("request:", error.request);
        console.log("=======================");
      } else {
        console.log("LOGIN UNKNOWN ERROR:", error);
      }
      const rawMessage =
        error instanceof ApiClientError
          ? `[${error.code}] ${error.message}`
          : error instanceof Error
            ? `${error.name}: ${error.message}`
            : String(error);

      Alert.alert("DEBUG - Gerçek Hata", rawMessage);
    },
  });
}
