import { useAuthStore } from "@/stores/auth-store";
import type { ApiResponse } from "@/types/api";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

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

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  if (!API_URL) {
    throw new ApiClientError(
      "EXPO_PUBLIC_API_URL tanimli degil (.env dosyani kontrol et)",
      0,
    );
  }

  const token = useAuthStore.getState().user?.token;

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: options.method ?? "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json: ApiResponse<T> = (await res
    .json()
    .catch(() => null)) as ApiResponse<T>;

  if (!json) {
    throw new ApiClientError("Sunucudan gecersiz yanit alindi.", res.status);
  }

  if (!json.success) {
    // Token gecersiz/suresi dolmussa otomatik logout
    if (res.status === 401) {
      useAuthStore.getState().logout();
    }
    throw new ApiClientError(
      json.error.message,
      res.status,
      json.error.code,
      json.error.details,
    );
  }

  return json.data;
}
