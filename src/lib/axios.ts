// lib/axios.ts
import axios, { AxiosError } from "axios";

import { isTokenExpired, useAuthStore } from "@/stores/auth-store";
import type { ApiResponse } from "@/types/api";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiClientError extends Error {
  code?: string;
  status: number;
  details?: unknown;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    console.log("AXIOS:", config.method?.toUpperCase(), config.url);

    const user = useAuthStore.getState().user;
    console.log("AXIOS: user from store", user);
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    // Basarili istekte {success:true, data} govdesini acip sadece data'yi geri veriyoruz
    const body = response.data as ApiResponse<unknown>;

    if (body && typeof body === "object" && "success" in body) {
      if (body.success) {
        return { ...response, data: body.data };
      }
      // success:false ama HTTP 200 donmus olabilir - yine de hata olarak firlat
      return Promise.reject(
        new ApiClientError(
          body.error.message,
          response.status,
          body.error.code,
          body.error.details,
        ),
      );
    }

    // Eski/farkli formatta donen response'lar (ornegin auth henuz eski formatta ise) oldugu gibi gecer
    return response;
  },

  async (error: AxiosError<ApiResponse<unknown>>) => {
    const isAuthEndpoint = error.config?.url?.includes("/api/auth");
    if (error.response?.status === 401 && !isAuthEndpoint) {
      const { user } = useAuthStore.getState();
      if (!user?.token || isTokenExpired(user.token)) {
        console.log("AXIOS: 401 Unauthorized (token expired), logout");
        await useAuthStore.getState().logout();
      }
    }

    const body = error.response?.data;
    if (
      body &&
      typeof body === "object" &&
      "success" in body &&
      !body.success
    ) {
      return Promise.reject(
        new ApiClientError(
          body.error.message,
          error.response!.status,
          body.error.code,
          body.error.details,
        ),
      );
    }

    // Network error, timeout vs. - orijinal axios hatasini oldugu gibi ilet
    return Promise.reject(error);
  },
);
